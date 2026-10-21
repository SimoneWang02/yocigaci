<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Game;
use App\Models\Order;
use App\Models\Product;
use App\Models\StockReservation;
use App\Models\User;
use App\Services\OrderFulfillmentService;
use App\Services\StockReservationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Stripe\Checkout\Session as StripeSession;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class StockReservationTest extends TestCase
{
    use RefreshDatabase;

    private function product(int $stock): Product
    {
        $game = Game::create(['name' => 'Gioco', 'slug' => 'gioco-'.uniqid()]);
        $category = Category::create(['game_id' => $game->id, 'name' => 'Cat', 'slug' => 'cat-'.uniqid()]);

        return Product::create([
            'game_id' => $game->id,
            'category_id' => $category->id,
            'name' => 'Box',
            'slug' => 'box-'.uniqid(),
            'price' => 10,
            'stock' => $stock,
            'is_active' => true,
        ]);
    }

    private function cartItem(Product $product, int $quantity): array
    {
        return ['id' => $product->id, 'name' => $product->name, 'quantity' => $quantity];
    }

    private function paidSession(Product $product, int $quantity, ?int $reservationId): StripeSession
    {
        return StripeSession::constructFrom([
            'id' => 'cs_test_'.uniqid(),
            'payment_status' => 'paid',
            'payment_intent' => 'pi_test_'.uniqid(),
            'customer_details' => ['email' => 'cliente@example.com'],
            'metadata' => array_filter([
                'items' => json_encode([['product_id' => $product->id, 'quantity' => $quantity]]),
                'shipping_address' => json_encode(['full_name' => 'Mario Rossi', 'phone' => '123']),
                'delivery_method' => 'pickup',
                'reservation_id' => $reservationId ? (string) $reservationId : null,
            ]),
        ]);
    }

    public function test_reserve_scala_lo_stock_e_blocca_il_secondo_checkout_sull_ultimo_pezzo(): void
    {
        $product = $this->product(1);
        $service = app(StockReservationService::class);

        $service->reserve([$this->cartItem($product, 1)]);
        $this->assertSame(0, $product->fresh()->stock);

        try {
            $service->reserve([$this->cartItem($product, 1)]);
            $this->fail('La seconda prenotazione doveva fallire.');
        } catch (HttpException $e) {
            $this->assertSame(422, $e->getStatusCode());
        }

        $this->assertSame(0, $product->fresh()->stock);
        $this->assertSame(1, StockReservation::count());
    }

    public function test_reserve_annulla_tutto_se_un_articolo_non_e_disponibile(): void
    {
        $available = $this->product(5);
        $soldOut = $this->product(0);

        try {
            app(StockReservationService::class)->reserve([
                $this->cartItem($available, 2),
                $this->cartItem($soldOut, 1),
            ]);
            $this->fail('La prenotazione doveva fallire.');
        } catch (HttpException) {
        }

        $this->assertSame(5, $available->fresh()->stock);
        $this->assertSame(0, StockReservation::count());
    }

    public function test_release_restituisce_lo_stock_una_sola_volta(): void
    {
        $product = $this->product(3);
        $service = app(StockReservationService::class);

        $reservation = $service->reserve([$this->cartItem($product, 2)]);
        $service->release($reservation);
        $service->release($reservation);

        $this->assertSame(3, $product->fresh()->stock);
        $this->assertSame(StockReservation::RELEASED, $reservation->fresh()->status);
    }

    public function test_fulfillment_con_prenotazione_non_scala_di_nuovo_lo_stock(): void
    {
        Mail::fake();
        $product = $this->product(2);
        $reservation = app(StockReservationService::class)->reserve([$this->cartItem($product, 1)]);

        $order = app(OrderFulfillmentService::class)->fulfillFromSession(
            $this->paidSession($product, 1, $reservation->id)
        );

        $this->assertInstanceOf(Order::class, $order);
        $this->assertSame(1, $product->fresh()->stock);
        $this->assertSame(StockReservation::COMPLETED, $reservation->fresh()->status);

        // Una prenotazione completata non puo' piu' restituire lo stock.
        app(StockReservationService::class)->release($reservation);
        $this->assertSame(1, $product->fresh()->stock);
    }

    public function test_fulfillment_senza_prenotazione_scala_lo_stock(): void
    {
        Mail::fake();
        $product = $this->product(2);

        app(OrderFulfillmentService::class)->fulfillFromSession($this->paidSession($product, 1, null));

        $this->assertSame(1, $product->fresh()->stock);
    }

    public function test_eliminare_un_prodotto_con_ordini_risponde_422_e_conserva_le_immagini(): void
    {
        Mail::fake();
        Storage::fake('public');
        $product = $this->product(2);
        Storage::disk('public')->put('products/foto.jpg', 'x');
        $product->images()->create(['path' => 'products/foto.jpg', 'sort_order' => 0]);
        app(OrderFulfillmentService::class)->fulfillFromSession($this->paidSession($product, 1, null));

        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->deleteJson("/api/admin/products/{$product->id}")->assertStatus(422);

        $this->assertModelExists($product);
        Storage::disk('public')->assertExists('products/foto.jpg');
    }

    public function test_eliminare_un_prodotto_senza_ordini_rimuove_anche_le_immagini(): void
    {
        Storage::fake('public');
        $product = $this->product(2);
        Storage::disk('public')->put('products/foto.jpg', 'x');
        $product->images()->create(['path' => 'products/foto.jpg', 'sort_order' => 0]);

        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->deleteJson("/api/admin/products/{$product->id}")->assertOk();

        $this->assertModelMissing($product);
        Storage::disk('public')->assertMissing('products/foto.jpg');
    }
}
