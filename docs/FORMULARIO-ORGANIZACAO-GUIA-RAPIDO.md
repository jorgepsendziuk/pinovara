# Guia Rápido - Formulário de Organizações

**Para Desenvolvedores** - Referência Rápida

---

## Estrutura em 3 Camadas

```
XML ODK (campo/hierarquia) 
    ↓
Schema Prisma (snake_case)
    ↓  
Frontend React (camelCase)
```

---

## Seções do Formulário

| # | Seção | Status | Componente | Tabela |
|---|-------|--------|------------|--------|
| 1 | Dados Básicos | ✅ | `DadosBasicos.tsx` | `organizacao` |
| 2 | Endereço/GPS | ✅ | `EnderecoLocalizacao.tsx` | `organizacao` |
| 3 | Representante | ✅ | `DadosRepresentante.tsx` | `organizacao` |
| 4 | Características | ❌ | **CRIAR** | `organizacao` |
| 5 | Abrangência Sócios | ❌ | **CRIAR** | `organizacao_abrangencia_socio` |
| 6 | Associados PJ | ❌ | **CRIAR** | `organizacao_abrangencia_pj` |
| 7 | Produção | ❌ | **CRIAR** | `organizacao_producao` |
| 8 | Arquivos | ✅ | `UploadDocumentos.tsx` | `organizacao_arquivo` |
| 9 | Fotos | ✅ | `UploadFotos.tsx` | `organizacao_foto` |
| 10 | GO - Governança | ⚠️ | Completar | `organizacao` |
| 11 | GP - Pessoas | ⚠️ | Completar | `organizacao` |
| 12 | GF - Financeira | ⚠️ | Completar | `organizacao` |
| 13 | GC - Comercial | ❌ | **CRIAR** | `organizacao` |
| 14 | GPP - Processos | ❌ | **CRIAR** | `organizacao` |
| 15 | GI - Inovação | ❌ | **CRIAR** | `organizacao` |
| 16 | GS - Socioambiental | ❌ | **CRIAR** | `organizacao` |
| 17 | IS - Infraestrutura | ❌ | **CRIAR** | `organizacao` |
| 18 | Orientações | ❌ | **CRIAR** | `organizacao` |
| 19 | Indicadores | ❌ | **CRIAR** | `organizacao_indicador` |
| 20 | Participantes | ❌ | **CRIAR** | `organizacao_participante` |
| 21 | Observações | ❌ | **CRIAR** | `organizacao` |
| 22 | Nível Maturidade | ❌ | **CRIAR** | Calculado |

---

## Padrão de Nomenclatura

### Conversão Rápida

```
XML:      caracteristicas/n_total_socios
Schema:   caracteristicas_n_total_socios  
Frontend: caracteristicasNTotalSocios

XML:      go/estrutura_1_resposta
Schema:   go_estrutura_1_resposta
Frontend: goEstrutura1Resposta

XML:      abrangencia_socios/num_socios
Schema:   num_socios (tabela organizacao_abrangencia_socio)
Frontend: numSocios
```

---

## Práticas Gerenciais: Nomenclatura

**Áreas**:
- `go` = Governança Organizacional
- `gp` = Gestão de Pessoas
- `gf` = Gestão Financeira
- `gc` = Gestão Comercial
- `gpp` = Gestão de Processos Produtivos
- `gi` = Gestão da Inovação
- `gs` = Gestão Socioambiental
- `is` = Infraestrutura Sustentável

**Template**:
```
[area]_[subarea]_[numero]_resposta    (Int: 1-4)
[area]_[subarea]_[numero]_comentario  (String)
[area]_[subarea]_[numero]_proposta    (String)
```

---

## Divergências Críticas (Schema ≠ XML)

| Área | XML | Schema | Usar |
|------|-----|--------|------|
| GO Controles | 22-27 | 20-25 | **XML** |
| GO Educação | 28-30 | 26-28 | **XML** |
| GC Comercial | 16-21 | 15-20 | **XML** |
| GC Modelo | 22-28 | 21-27 | **XML** |

**Solução Temporária**: Criar mapeamento no backend ou aceitar numeração do schema.

---

## Listas Auxiliares (Dropdowns)

| Lista | Tabela Aux | Valores |
|-------|------------|---------|
| Estado | `estado` | 1-27 (AC até TO) |
| Município | `municipio_ibge` | ~5570 municípios |
| Resposta | `resposta` | 1=Sim, 2=Não, 3=Parcial, 4=NA |
| Sim/Não | `sim_nao` | 1=Sim, 2=Não |
| Grupo Foto | `grupo` | 1-5, 99 |
| Função | `funcao` | Vários |
| Ênfase | `enfase` | 1-5, 99 |
| Relação | `relacao` | 1-4, 99 |
| Indicador | `indicador` | 1-16 |

---

## Template de Componente Accordion

```tsx
interface Props {
  organizacao: Organizacao;
  onUpdate: (campo: string, valor: any) => Promise<void>;
  accordionAberto: string | null;
  onToggleAccordion: (id: string) => void;
}

export function MeuComponente({ 
  organizacao, 
  onUpdate, 
  accordionAberto, 
  onToggleAccordion 
}: Props) {
  const isAberto = accordionAberto === 'meu-id';
  
  return (
    <div className="accordion-item">
      <div 
        className="accordion-header"
        onClick={() => onToggleAccordion('meu-id')}
      >
        <h3>Título da Seção</h3>
        {isAberto ? <ChevronUp /> : <ChevronDown />}
      </div>
      
      {isAberto && (
        <div className="accordion-content">
          {/* Campos aqui */}
        </div>
      )}
    </div>
  );
}
```

---

## Template de Componente CRUD (Repeating)

```tsx
interface Props {
  organizacaoId: number;
  accordionAberto: string | null;
  onToggleAccordion: (id: string) => void;
}

export function TabelaRelacionada({ 
  organizacaoId, 
  accordionAberto, 
  onToggleAccordion 
}: Props) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadItems();
  }, [organizacaoId]);
  
  const loadItems = async () => {
    const response = await api.get(`/organizacoes/${organizacaoId}/items`);
    setItems(response.data);
  };
  
  const handleAdd = async (item: Item) => {
    await api.post(`/organizacoes/${organizacaoId}/items`, item);
    loadItems();
  };
  
  const handleUpdate = async (id: number, item: Item) => {
    await api.put(`/organizacoes/${organizacaoId}/items/${id}`, item);
    loadItems();
  };
  
  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir?')) return;
    await api.delete(`/organizacoes/${organizacaoId}/items/${id}`);
    loadItems();
  };
  
  return (
    <div className="accordion-item">
      {/* Header e conteúdo */}
    </div>
  );
}
```

---

## Validações Essenciais

```javascript
// CNPJ
validarCNPJ(cnpj) // true/false

// CPF
validarCPF(cpf) // true/false

// CEP
validarCEP(cep) // true/false (8 dígitos)

// Constraint
valor <= limite // para características

// Foreign Key
municipio.idEstado === estadoSelecionado
```

---

## Cálculos Importantes

```javascript
// % de sócios com CAF
(nTotalSociosCaf / nTotalSocios * 100)

// % acessando PNAE
(nSociosPnae / nTotalSociosCaf * 100)

// Nível de maturidade (média)
// Sim=5, Parcial=2.5, Não=0, NA=não conta
mediaNotas = soma / contador
nivel = mediaParaNivel(mediaNotas) // 0-5
```

---

## Endpoints API (padrão)

```
# Principal
GET    /api/organizacoes/:id
PUT    /api/organizacoes/:id
PATCH  /api/organizacoes/:id

# Relacionadas
GET    /api/organizacoes/:id/[tabela]
POST   /api/organizacoes/:id/[tabela]
PUT    /api/organizacoes/:id/[tabela]/:itemId
DELETE /api/organizacoes/:id/[tabela]/:itemId

# Auxiliares
GET /api/estados
GET /api/municipios?estadoId=:id
GET /api/listas/[tipo]
```

---

## Cores do Sistema

- Branco: `#ffffff`
- Marrom: `#3b2313`
- Verde: `#056839`

**Alertas**:
- Erro: `#d32f2f` (vermelho)
- Aviso: `#f57c00` (laranja)
- Info: `#1976d2` (azul)
- Sucesso: `#388e3c` (verde)

---

## Arquivos de Referência

1. **Estrutura Completa**: `FORMULARIO-ORGANIZACAO-ESTRUTURA.md`
2. **Mapeamento**: `FORMULARIO-ORGANIZACAO-MAPEAMENTO.md`
3. **Validações**: `FORMULARIO-ORGANIZACAO-VALIDACOES.md`
4. **Fonte XML**: `docs/forms/organizacao/ORGANIZAÇÃO.xml`
5. **Schema**: `backend/prisma/schema.prisma`

---

## Próximos Componentes a Criar (ordem)

1. ✅ **CaracteristicasAssociados.tsx** - 32 campos numéricos com totalizadores
2. ✅ **AbrangenciaGeografica.tsx** - CRUD de municípios
3. ✅ **ProducaoOrganizacao.tsx** - CRUD de culturas
4. ✅ **GestaoComercial.tsx** - 28 práticas
5. ✅ **ProcessosProdutivos.tsx** - 29 práticas
6. ✅ **GestaoInovacao.tsx** - 14 práticas
7. ✅ **GestaoSocioambiental.tsx** - 22 práticas
8. ✅ **InfraestruturaSustentavel.tsx** - 18 práticas
9. ✅ **NivelMaturidade.tsx** - Cálculo e visualização

---

## Comandos Úteis

```bash
# Verificar schema
cd backend
npx prisma studio

# Ver dados de uma organização
psql -d pinovara -c "SELECT * FROM pinovara.organizacao WHERE id = 1"

# Contar práticas por área
grep -c "_resposta" backend/prisma/schema.prisma

# Ver estrutura XML
head -n 100 docs/forms/organizacao/ORGANIZAÇÃO.xml
```

---

**Última Atualização**: 12/10/2025  
**Mantido Por**: Equipe de Desenvolvimento PINOVARA
