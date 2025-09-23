<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Services\AlocacaoService;

class AlocacaoServiceTest extends TestCase
{
    private AlocacaoService $alocacaoService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->alocacaoService = new AlocacaoService();
    }

    /**
     * Test that service can be instantiated.
     */
    public function test_service_can_be_instantiated(): void
    {
        $this->assertInstanceOf(AlocacaoService::class, $this->alocacaoService);
    }

    /**
     * Test that service has required methods.
     */
    public function test_service_has_required_methods(): void
    {
        $this->assertTrue(method_exists($this->alocacaoService, 'calcularPontuacaoCrianca'));
        $this->assertTrue(method_exists($this->alocacaoService, 'executarAlocacaoAutomatica'));
        $this->assertTrue(method_exists($this->alocacaoService, 'tentarAlocarCrianca'));
    }
}
