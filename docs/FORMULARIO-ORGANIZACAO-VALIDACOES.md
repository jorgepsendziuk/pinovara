# Validações e Cálculos Automáticos - Formulário de Organizações

**Data**: 12/10/2025  
**Fonte**: `ORGANIZAÇÃO.xml` - Constraints e cálculos do ODK

---

## 1. Validações de Documentos

### 1.1 Validação de CNPJ

**Regras**:
1. Deve ter exatamente 14 dígitos numéricos
2. Não pode ser sequência repetida
3. Dígitos verificadores devem ser válidos

**Sequências Proibidas**:
```
00000000000000
11111111111111
22222222222222
33333333333333
44444444444444
55555555555555
66666666666666
77777777777777
88888888888888
99999999999999
```

**Algoritmo de Validação**:

```javascript
function validarCNPJ(cnpj) {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/\D/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;
  
  // Verifica sequências repetidas
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  // Calcula primeiro dígito verificador
  let soma = 0;
  let peso = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    soma += parseInt(cnpj[i]) * peso[i];
  }
  let dv1 = soma % 11;
  dv1 = dv1 < 2 ? 0 : 11 - dv1;
  
  // Verifica primeiro DV
  if (parseInt(cnpj[12]) !== dv1) return false;
  
  // Calcula segundo dígito verificador
  soma = 0;
  peso = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    soma += parseInt(cnpj[i]) * peso[i];
  }
  let dv2 = soma % 11;
  dv2 = dv2 < 2 ? 0 : 11 - dv2;
  
  // Verifica segundo DV
  if (parseInt(cnpj[13]) !== dv2) return false;
  
  return true;
}
```

**Mensagem de Erro**: "CNPJ inválido ou incorreto. Verifique o número digitado."

### 1.2 Validação de CPF

**Regras**:
1. Deve ter exatamente 11 dígitos numéricos
2. Não pode ser sequência repetida
3. Dígitos verificadores devem ser válidos

**Sequências Proibidas**:
```
00000000000
11111111111
22222222222
33333333333
44444444444
55555555555
66666666666
77777777777
88888888888
99999999999
```

**Algoritmo de Validação**:

```javascript
function validarCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica sequências repetidas
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  // Calcula primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf[i]) * (10 - i);
  }
  let resto = soma % 11;
  let dv1 = resto < 2 ? 0 : 11 - resto;
  
  // Verifica primeiro DV
  if (parseInt(cpf[9]) !== dv1) return false;
  
  // Calcula segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf[i]) * (11 - i);
  }
  resto = soma % 11;
  let dv2 = resto < 2 ? 0 : 11 - resto;
  
  // Verifica segundo DV
  if (parseInt(cpf[10]) !== dv2) return false;
  
  return true;
}
```

**Mensagem de Erro**: "CPF digitado é inválido"

**Aplicável a**:
- `representante_cpf`
- `participante_cpf` (em cada item do repeat)

### 1.3 Validação de CEP

**Regras**:
- Deve ter exatamente 8 dígitos numéricos

```javascript
function validarCEP(cep) {
  cep = cep.replace(/\D/g, '');
  return cep.length === 8;
}
```

**Mensagem de Erro**: "O CEP deve conter 8 números"

**Aplicável a**:
- `organizacao_cep`
- `representante_cep`

---

## 2. Validações de Características dos Associados

### 2.1 Constraints Numéricos

| Campo | Validação | Mensagem de Erro |
|-------|-----------|------------------|
| `n_total_socios` | > 0 | "Deve haver pelo menos 1 sócio" |
| `n_total_socios_caf` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `n_distintos_caf` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_af_homem` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_af_mulher` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_a_homem` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_a_mulher` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_p_homem` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_p_mulher` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_i_homem` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_i_mulher` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_q_homem` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_q_mulher` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_e_homem` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_e_mulher` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_o_homem` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_o_mulher` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_caf_organico` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_caf_agroecologico` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_caf_transicao` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `ta_caf_convencional` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `n_ativos_total` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `n_ativos_caf` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `n_naosocio_op_total` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `n_naosocio_op_caf` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `n_socios_paa` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `n_naosocios_paa` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `n_socios_pnae` | <= n_total_socios | "Não pode ser maior que o total de sócios" |
| `n_naosocios_pnae` | <= n_total_socios | "Não pode ser maior que o total de sócios" |

### 2.2 Validações Cruzadas Recomendadas (não no ODK, mas úteis)

```javascript
// Avisos (não bloqueantes)
function validarCaracteristicasComAvisos(dados) {
  const avisos = [];
  
  // Soma de categorias por gênero
  const totalHomens = 
    (dados.taAfHomem || 0) + 
    (dados.taAHomem || 0) + 
    (dados.taPHomem || 0) + 
    (dados.taIHomem || 0) + 
    (dados.taQHomem || 0) + 
    (dados.taEHomem || 0) + 
    (dados.taOHomem || 0);
    
  const totalMulheres = 
    (dados.taAfMulher || 0) + 
    (dados.taAMulher || 0) + 
    (dados.taPMulher || 0) + 
    (dados.taIMulher || 0) + 
    (dados.taQMulher || 0) + 
    (dados.taEMulher || 0) + 
    (dados.taOMulher || 0);
  
  const totalCategorias = totalHomens + totalMulheres;
  
  if (totalCategorias > dados.nTotalSocios) {
    avisos.push('⚠️ A soma das categorias excede o total de sócios');
  }
  
  // Soma de tipos de produção
  const totalProducao = 
    (dados.taCafOrganico || 0) + 
    (dados.taCafAgroecologico || 0) + 
    (dados.taCafTransicao || 0) + 
    (dados.taCafConvencional || 0);
  
  if (totalProducao > dados.nTotalSociosCaf) {
    avisos.push('⚠️ A soma dos tipos de produção excede o total de sócios com CAF');
  }
  
  // Sócios com CAF não pode ser maior que distintos
  if (dados.nTotalSociosCaf < dados.nDistintosCaf) {
    avisos.push('⚠️ Número de sócios com CAF não pode ser menor que número de CAF distintos');
  }
  
  return avisos;
}
```

---

## 3. Validações de Produção

| Campo | Validação | Mensagem |
|-------|-----------|----------|
| `producao/cultura` | required | "Nome da cultura é obrigatório" |
| `producao/mensal` | >= 0 | "Valor deve ser maior ou igual a zero" |
| `producao/anual` | >= 0 | "Valor deve ser maior ou igual a zero" |

### 3.1 Validação Cruzada Mensal vs Anual

```javascript
function validarProducao(mensal, anual) {
  // Aviso se anual < mensal * 12 (esperado seria próximo)
  if (anual > 0 && mensal > 0) {
    const estimativaAnual = mensal * 12;
    const diferenca = Math.abs(anual - estimativaAnual) / estimativaAnual;
    
    if (diferenca > 0.5) { // mais de 50% de diferença
      return {
        type: 'warning',
        message: `Atenção: Produção anual (${anual}kg) parece inconsistente com mensal (${mensal}kg × 12 = ${estimativaAnual}kg)`
      };
    }
  }
  return null;
}
```

---

## 4. Validações de Abrangência Geográfica

### 4.1 Sócios por Município

| Campo | Validação | Mensagem |
|-------|-----------|----------|
| `estado_socio` | required | "Estado é obrigatório" |
| `municipio_ibge_socio` | required + must be from selected state | "Município é obrigatório" |
| `num_socios` | >= 0 | "Deve ser maior ou igual a zero" |

### 4.2 Validação Agregada

```javascript
function validarAbrangenciaTotal(abrangencias, nTotalSocios) {
  const somaSocios = abrangencias.reduce((acc, item) => acc + (item.numSocios || 0), 0);
  
  if (somaSocios > nTotalSocios) {
    return {
      type: 'error',
      message: `A soma de sócios nos municípios (${somaSocios}) não pode ser maior que o total de sócios (${nTotalSocios})`
    };
  }
  
  if (somaSocios < nTotalSocios) {
    return {
      type: 'warning',
      message: `A soma de sócios nos municípios (${somaSocios}) é menor que o total de sócios (${nTotalSocios}). Verifique se todos os municípios foram cadastrados.`
    };
  }
  
  return null;
}
```

---

## 5. Validações de Associados PJ

### 5.1 Validação Individual

| Campo | Validação | Mensagem |
|-------|-----------|----------|
| `cnpj_pj` | validarCNPJ() | "CNPJ digitado é inválido" |
| `razao_social` | required | "Razão social é obrigatória" |
| `sigla` | required | "Sigla é obrigatória" |
| `num_socios_total` | >= 0 | "Deve ser maior ou igual a zero" |
| `num_socios_caf` | <= num_socios_total | "Não pode ser maior que o total de sócios da organização" |

### 5.2 CNPJ Duplicado

```javascript
async function verificarCNPJDuplicado(cnpj, organizacaoId, itemId) {
  // Verificar se já existe outro associado PJ com mesmo CNPJ
  // na mesma organização (excluindo o item atual se for edição)
  const existe = await api.get(`/organizacoes/${organizacaoId}/abrangencia-pj/verificar-cnpj`, {
    params: { cnpj, excluirId: itemId }
  });
  
  if (existe.data.duplicado) {
    return {
      type: 'error',
      message: 'Já existe um associado PJ cadastrado com este CNPJ'
    };
  }
  return null;
}
```

---

## 6. Validações de Práticas Gerenciais

### 6.1 Validação de Resposta

| Campo | Validação | Valores Permitidos |
|-------|-----------|-------------------|
| `*_resposta` | required | 1=Sim, 2=Não, 3=Parcial, 4=Não se Aplica |
| `*_comentario` | optional | Texto livre |
| `*_proposta` | optional | Texto livre |

```typescript
type RespostaPratica = 1 | 2 | 3 | 4;

interface PraticaValidation {
  resposta: RespostaPratica;
  comentario?: string;
  proposta?: string;
}

function validarPratica(pratica: PraticaValidation) {
  if (!pratica.resposta || ![1, 2, 3, 4].includes(pratica.resposta)) {
    return {
      type: 'error',
      message: 'Selecione uma resposta válida'
    };
  }
  return null;
}
```

### 6.2 Recomendações de Preenchimento

```javascript
function verificarCompletudesPraticas(pratica) {
  const avisos = [];
  
  // Se respondeu "Não", recomenda preencher proposta
  if (pratica.resposta === 2 && !pratica.proposta) {
    avisos.push({
      type: 'info',
      message: 'Considere adicionar uma proposta de melhoria'
    });
  }
  
  // Se respondeu "Parcial", recomenda preencher comentário E proposta
  if (pratica.resposta === 3) {
    if (!pratica.comentario) {
      avisos.push({
        type: 'info',
        message: 'Considere detalhar a situação parcial no comentário'
      });
    }
    if (!pratica.proposta) {
      avisos.push({
        type: 'info',
        message: 'Considere adicionar proposta para completar a prática'
      });
    }
  }
  
  return avisos;
}
```

---

## 7. Cálculos Automáticos

### 7.1 Percentuais de Características

```javascript
function calcularPercentuais(dados) {
  const percentuais = {};
  
  if (dados.nTotalSocios > 0) {
    // % de sócios com CAF
    percentuais.percSociosComCaf = 
      (dados.nTotalSociosCaf / dados.nTotalSocios * 100).toFixed(2);
    
    // % de sócios ativos
    percentuais.percSociosAtivos = 
      (dados.nAtivosTotal / dados.nTotalSocios * 100).toFixed(2);
    
    // % de sócios ativos com CAF
    if (dados.nTotalSociosCaf > 0) {
      percentuais.percSociosAtivosCaf = 
        (dados.nAtivosCaf / dados.nTotalSociosCaf * 100).toFixed(2);
    }
    
    // % acessando PAA
    if (dados.nTotalSociosCaf > 0) {
      percentuais.percAcessandoPAA = 
        (dados.nSociosPaa / dados.nTotalSociosCaf * 100).toFixed(2);
    }
    
    // % acessando PNAE
    if (dados.nTotalSociosCaf > 0) {
      percentuais.percAcessandoPNAE = 
        (dados.nSociosPnae / dados.nTotalSociosCaf * 100).toFixed(2);
    }
    
    // % de ampliação (novos sócios)
    percentuais.percAmpliacaoTotal = 
      (dados.nIngressaramTotal12Meses / dados.nTotalSocios * 100).toFixed(2);
    
    if (dados.nTotalSociosCaf > 0) {
      percentuais.percAmpliacaoCaf = 
        (dados.nIngressaramCaf12Meses / dados.nTotalSociosCaf * 100).toFixed(2);
    }
  }
  
  return percentuais;
}
```

### 7.2 Totalizadores de Categoria

```javascript
function calcularTotalizadores(dados) {
  const totalizadores = {};
  
  // Total por categoria
  totalizadores.totalAF = (dados.taAfHomem || 0) + (dados.taAfMulher || 0);
  totalizadores.totalAssentado = (dados.taAHomem || 0) + (dados.taAMulher || 0);
  totalizadores.totalPescador = (dados.taPHomem || 0) + (dados.taPMulher || 0);
  totalizadores.totalIndigena = (dados.taIHomem || 0) + (dados.taIMulher || 0);
  totalizadores.totalQuilombola = (dados.taQHomem || 0) + (dados.taQMulher || 0);
  totalizadores.totalExtrativista = (dados.taEHomem || 0) + (dados.taEMulher || 0);
  totalizadores.totalOutro = (dados.taOHomem || 0) + (dados.taOMulher || 0);
  
  // Total geral por categorias
  totalizadores.totalPorCategorias = 
    totalizadores.totalAF +
    totalizadores.totalAssentado +
    totalizadores.totalPescador +
    totalizadores.totalIndigena +
    totalizadores.totalQuilombola +
    totalizadores.totalExtrativista +
    totalizadores.totalOutro;
  
  // Total por gênero
  totalizadores.totalHomens = 
    (dados.taAfHomem || 0) +
    (dados.taAHomem || 0) +
    (dados.taPHomem || 0) +
    (dados.taIHomem || 0) +
    (dados.taQHomem || 0) +
    (dados.taEHomem || 0) +
    (dados.taOHomem || 0);
    
  totalizadores.totalMulheres = 
    (dados.taAfMulher || 0) +
    (dados.taAMulher || 0) +
    (dados.taPMulher || 0) +
    (dados.taIMulher || 0) +
    (dados.taQMulher || 0) +
    (dados.taEMulher || 0) +
    (dados.taOMulher || 0);
  
  // Total por tipo de produção
  totalizadores.totalPorProducao = 
    (dados.taCafOrganico || 0) +
    (dados.taCafAgroecologico || 0) +
    (dados.taCafTransicao || 0) +
    (dados.taCafConvencional || 0);
  
  return totalizadores;
}
```

### 7.3 Indicadores Visuais de Consistência

```javascript
function verificarConsistencia(dados, totalizadores) {
  const status = {};
  
  // Status de categorias vs total
  if (totalizadores.totalPorCategorias === dados.nTotalSocios) {
    status.categorias = 'success'; // Fundo azul
  } else if (totalizadores.totalPorCategorias > dados.nTotalSocios) {
    status.categorias = 'error'; // Fundo vermelho
  } else {
    status.categorias = 'warning'; // Fundo amarelo
  }
  
  // Status de produção vs total com CAF
  if (totalizadores.totalPorProducao === dados.nTotalSociosCaf) {
    status.producao = 'success';
  } else if (totalizadores.totalPorProducao > dados.nTotalSociosCaf) {
    status.producao = 'error';
  } else {
    status.producao = 'warning';
  }
  
  return status;
}
```

---

## 8. Validações de Campos Condicionais

### 8.1 Ênfase Outros

```javascript
// Campo obrigatório apenas se enfase = 99 (Outros)
function validarEnfase(enfase, enfaseOutros) {
  if (enfase === 99 && !enfaseOutros) {
    return {
      type: 'error',
      message: 'Especifique qual é a outra ênfase'
    };
  }
  return null;
}
```

### 8.2 Relação de Participante Outros

```javascript
// Campo obrigatório apenas se relacao = 99 (Outro)
function validarRelacaoParticipante(relacao, relacaoOutros) {
  if (relacao === 99 && !relacaoOutros) {
    return {
      type: 'error',
      message: 'Especifique qual é a outra relação'
    };
  }
  return null;
}
```

### 8.3 Visibilidade Condicional

| Grupo | Condição | Campo Controlador |
|-------|----------|-------------------|
| `file` (arquivos) | `sim_nao_file` = 1 | `simNaoFile` |
| `producao` | `sim_nao_producao` = 1 | `simNaoProducao` |
| `abrangencia_socios` | `sim_nao_socio` = 1 | `simNaoSocio` |
| `abrangencia_pj` | `sim_nao_pj` = 1 | `simNaoPj` |
| `participantes` | `participantes_menos_10` = 1 | `participantesMenos10` |
| `enfase_outros` | `enfase` = 99 | `enfase` |
| `participante_relacao_outros` | `participante_relacao` = 99 | Dentro de cada item |

---

## 9. Validações de Limites de Caracteres

| Campo | Limite | Tipo |
|-------|--------|------|
| `nome` | 255 | VarChar |
| `cnpj` | 14 | VarChar |
| `telefone` | 15-20 | VarChar |
| `email` | 255 | VarChar |
| `cep` | 8 | VarChar(8) |
| `cpf` | 11 | VarChar(11) |
| `descricao` | 8192 | Text |
| `obs` | 8192 | Text |
| `metodologia` | 8192 | Text |
| `orientacoes` | 8192 | Text |
| `*_comentario` | 255-1000 | VarChar |
| `*_proposta` | 255-1000 | VarChar |

**Recomendação**: Implementar contador de caracteres em campos com limite, mostrando "X/8192" enquanto digita.

---

## 10. Cálculo do Nível de Maturidade

### 10.1 Conversão de Respostas para Notas

```javascript
function converterRespostaParaNota(resposta) {
  switch(resposta) {
    case 1: return 5;  // Sim = 5 pontos
    case 2: return 0;  // Não = 0 pontos
    case 3: return 2.5; // Parcial = 2.5 pontos
    case 4: return null; // Não se Aplica = não conta
    default: return null;
  }
}
```

### 10.2 Média por Área

```javascript
function calcularMediaArea(praticas) {
  let soma = 0;
  let contador = 0;
  
  for (const pratica of praticas) {
    const nota = converterRespostaParaNota(pratica.resposta);
    if (nota !== null) {
      soma += nota;
      contador++;
    }
  }
  
  return contador > 0 ? (soma / contador) : null;
}
```

### 10.3 Exemplo: Governança Organizacional

```javascript
function calcularMaturidadeGovernanca(go) {
  const praticas = [
    go.estrutura1Resposta,
    go.estrutura2Resposta,
    go.estrutura3Resposta,
    go.estrutura4Resposta,
    go.estrategia5Resposta,
    go.estrategia6Resposta,
    go.organizacao7Resposta,
    go.organizacao8Resposta,
    go.organizacao9Resposta,
    go.organizacao10Resposta,
    go.organizacao11Resposta,
    go.organizacao12Resposta,
    go.organizacao13Resposta,
    go.direcao14Resposta,
    go.direcao15Resposta,
    go.direcao16Resposta,
    go.direcao17Resposta,
    go.direcao18Resposta,
    go.direcao19Resposta,
    go.direcao20Resposta,
    go.direcao21Resposta,
    go.controle22Resposta, // ou 20 dependendo do schema
    go.controle23Resposta,
    go.controle24Resposta,
    go.controle25Resposta,
    go.controle26Resposta,
    go.controle27Resposta,
    go.educacao28Resposta, // ou 26 dependendo do schema
    go.educacao29Resposta,
    go.educacao30Resposta,
  ];
  
  return calcularMediaArea(praticas.map(r => ({ resposta: r })));
}
```

### 10.4 Conversão de Média para Nível

```javascript
function mediaParaNivel(media) {
  if (media === null) return 0;
  if (media === 0) return 0;
  if (media <= 1) return 1;
  if (media <= 2) return 2;
  if (media <= 3.5) return 3;
  if (media <= 4.5) return 4;
  return 5;
}
```

### 10.5 Labels dos Níveis de Maturidade

```javascript
const NIVEIS_MATURIDADE = {
  0: {
    label: 'Inexistente',
    cor: '#999'
  },
  1: {
    label: 'Inicial',
    descricao: 'Processos ocorrem de maneira imprevisível e sem controle',
    cor: '#d32f2f'
  },
  2: {
    label: 'Em Desenvolvimento',
    descricao: 'Processos disciplinados e sistêmicos, mas há muitas melhorias a fazer',
    cor: '#f57c00'
  },
  3: {
    label: 'Funciona Bem',
    descricao: 'Opera de maneira sistêmica, processos consistentes e padronizados',
    cor: '#fbc02d'
  },
  4: {
    label: 'Funciona Muito Bem',
    descricao: 'Processos previsíveis e controlados, em alinhamento com planejado',
    cor: '#689f38'
  },
  5: {
    label: 'Excelente',
    descricao: 'Forte integração entre áreas, processos consolidados e em contínuo aperfeiçoamento',
    cor: '#388e3c'
  }
};
```

### 10.6 Cálculo do Nível Geral

```javascript
function calcularNivelGeral(niveis) {
  // niveis = { governanca: 3, pessoas: 3, financeira: 4, comercial: 3, ... }
  
  const valores = Object.values(niveis).filter(v => v !== null && v !== 0);
  
  if (valores.length === 0) return 0;
  
  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  
  return Number(media.toFixed(1)); // Mantém 1 casa decimal
}
```

---

## 11. Validações de Arquivos Upload

### 11.1 Documentos (PDF, Excel, Word)

```javascript
const TIPOS_ARQUIVO_PERMITIDOS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const TAMANHO_MAX_ARQUIVO = 10 * 1024 * 1024; // 10MB

function validarArquivo(file) {
  if (!TIPOS_ARQUIVO_PERMITIDOS.includes(file.type)) {
    return {
      type: 'error',
      message: 'Tipo de arquivo não permitido. Use PDF, Word ou Excel.'
    };
  }
  
  if (file.size > TAMANHO_MAX_ARQUIVO) {
    return {
      type: 'error',
      message: 'Arquivo muito grande. Tamanho máximo: 10MB'
    };
  }
  
  return null;
}
```

### 11.2 Fotos

```javascript
const TIPOS_IMAGEM_PERMITIDOS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
];

const TAMANHO_MAX_FOTO = 5 * 1024 * 1024; // 5MB

function validarFoto(file) {
  if (!TIPOS_IMAGEM_PERMITIDOS.includes(file.type)) {
    return {
      type: 'error',
      message: 'Tipo de imagem não permitido. Use JPG ou PNG.'
    };
  }
  
  if (file.size > TAMANHO_MAX_FOTO) {
    return {
      type: 'error',
      message: 'Imagem muito grande. Tamanho máximo: 5MB'
    };
  }
  
  return null;
}
```

### 11.3 Assinaturas Digitais

```javascript
const TAMANHO_MAX_ASSINATURA = 500 * 1024; // 500KB

function validarAssinatura(file) {
  if (!file.type.startsWith('image/')) {
    return {
      type: 'error',
      message: 'Assinatura deve ser uma imagem'
    };
  }
  
  if (file.size > TAMANHO_MAX_ASSINATURA) {
    return {
      type: 'error',
      message: 'Assinatura muito grande. Tamanho máximo: 500KB'
    };
  }
  
  return null;
}
```

---

## 12. Validações de Datas

### 12.1 Data de Fundação

```javascript
function validarDataFundacao(dataFundacao) {
  const data = new Date(dataFundacao);
  const hoje = new Date();
  const anoMinimo = 1900;
  
  if (data > hoje) {
    return {
      type: 'error',
      message: 'Data de fundação não pode ser no futuro'
    };
  }
  
  if (data.getFullYear() < anoMinimo) {
    return {
      type: 'warning',
      message: `Data de fundação muito antiga (antes de ${anoMinimo}). Confirme se está correta.`
    };
  }
  
  return null;
}
```

### 12.2 Data de Visita

```javascript
function validarDataVisita(dataVisita) {
  const data = new Date(dataVisita);
  const hoje = new Date();
  const umAnoAtras = new Date();
  umAnoAtras.setFullYear(hoje.getFullYear() - 1);
  
  if (data > hoje) {
    return {
      type: 'error',
      message: 'Data de visita não pode ser no futuro'
    };
  }
  
  if (data < umAnoAtras) {
    return {
      type: 'warning',
      message: 'Data de visita é de mais de 1 ano atrás. Confirme se está correta.'
    };
  }
  
  return null;
}
```

---

## 13. Formatação de Campos

### 13.1 Máscaras de Entrada

```javascript
// CNPJ: 00.000.000/0000-00
function formatarCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, '');
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

// CPF: 000.000.000-00
function formatarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

// CEP: 00000-000
function formatarCEP(cep) {
  cep = cep.replace(/\D/g, '');
  return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

// Telefone Fixo: (00) 0000-0000
function formatarTelefoneFixo(tel) {
  tel = tel.replace(/\D/g, '');
  return tel.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
}

// Telefone Celular: (00) 0.0000-0000 ou (00) 00000-0000
function formatarTelefoneCelular(tel) {
  tel = tel.replace(/\D/g, '');
  if (tel.length === 11) {
    return tel.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  return tel;
}

// Detectar e formatar automaticamente
function formatarTelefone(tel) {
  tel = tel.replace(/\D/g, '');
  if (tel.length === 10) return formatarTelefoneFixo(tel);
  if (tel.length === 11) return formatarTelefoneCelular(tel);
  return tel;
}
```

### 13.2 Formatação de Valores Decimais

```javascript
// Produção: separador de milhar e 2 casas decimais
function formatarVolume(valor) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
}

// Percentuais
function formatarPercentual(valor) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: 'percent'
  }).format(valor / 100);
}
```

---

## 14. Validações de Relacionamentos

### 14.1 Estado → Município

```javascript
// Município deve pertencer ao estado selecionado
async function validarMunicipioDoEstado(municipioId, estadoId) {
  const municipio = await api.get(`/api/municipios/${municipioId}`);
  
  if (municipio.data.idEstado !== estadoId) {
    return {
      type: 'error',
      message: 'Este município não pertence ao estado selecionado'
    };
  }
  
  return null;
}
```

### 14.2 Validação de Foreign Keys

```javascript
// Genérico para verificar se FK existe
async function validarForeignKey(tabela, id) {
  try {
    const response = await api.get(`/api/${tabela}/${id}`);
    return response.data ? null : {
      type: 'error',
      message: `Registro não encontrado em ${tabela}`
    };
  } catch (error) {
    return {
      type: 'error',
      message: `Erro ao validar ${tabela}: ${error.message}`
    };
  }
}
```

---

## 15. Validações de Integridade de Dados

### 15.1 Checklist de Completude por Seção

```javascript
function verificarCompletudeSecao(secao, dados) {
  const camposObrigatorios = CAMPOS_OBRIGATORIOS[secao];
  const camposFaltantes = [];
  
  for (const campo of camposObrigatorios) {
    if (!dados[campo] || dados[campo] === '') {
      camposFaltantes.push(campo);
    }
  }
  
  return {
    completa: camposFaltantes.length === 0,
    percentual: ((camposObrigatorios.length - camposFaltantes.length) / camposObrigatorios.length * 100).toFixed(0),
    faltantes: camposFaltantes
  };
}

// Exemplo de uso:
const CAMPOS_OBRIGATORIOS = {
  'dados-basicos': ['nome', 'cnpj', 'dataFundacao', 'telefone', 'email'],
  'endereco': ['estado', 'municipio', 'organizacaoEndLogradouro', 'organizacaoEndNumero', 'organizacaoEndCep'],
  'representante': ['representanteNome', 'representanteCpf', 'representanteTelefone'],
  'caracteristicas': ['nTotalSocios', 'nTotalSociosCaf', 'nDistintosCaf', /* ... */],
  // ... outras seções
};
```

### 15.2 Indicador Visual de Completude

```javascript
function calcularCompletudeGeral(organizacao) {
  const secoes = [
    'dados-basicos',
    'endereco',
    'representante',
    'caracteristicas',
    'governanca',
    'pessoas',
    'financeira',
    'comercial',
    'processos',
    'inovacao',
    'socioambiental',
    'infraestrutura'
  ];
  
  let totalCampos = 0;
  let camposPreenchidos = 0;
  
  for (const secao of secoes) {
    const completude = verificarCompletudeSecao(secao, organizacao);
    const obrigatorios = CAMPOS_OBRIGATORIOS[secao].length;
    totalCampos += obrigatorios;
    camposPreenchidos += obrigatorios - completude.faltantes.length;
  }
  
  return {
    percentual: (camposPreenchidos / totalCampos * 100).toFixed(0),
    totalCampos,
    camposPreenchidos,
    camposFaltantes: totalCampos - camposPreenchidos
  };
}
```

---

## 16. Validações Backend (Importantes!)

### 16.1 Sanitização de Entrada

```typescript
// Backend: sanitizar antes de salvar
function sanitizarString(str: string | null): string | null {
  if (!str) return null;
  
  // Remove caracteres perigosos
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove < e >
    .substring(0, 8192); // Limite máximo
}

function sanitizarCNPJ(cnpj: string | null): string | null {
  if (!cnpj) return null;
  return cnpj.replace(/\D/g, '').substring(0, 14);
}

function sanitizarCPF(cpf: string | null): string | null {
  if (!cpf) return null;
  return cpf.replace(/\D/g, '').substring(0, 11);
}
```

### 16.2 Validação de Permissões

```typescript
// Verificar se usuário pode editar esta organização
async function validarPermissaoEdicao(userId: number, organizacaoId: number) {
  // Exemplo: verificar se é admin ou técnico responsável
  const organizacao = await prisma.organizacao.findUnique({
    where: { id: organizacaoId }
  });
  
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { user_roles: { include: { roles: true } } }
  });
  
  // Admin sempre pode
  const isAdmin = user.user_roles.some(ur => ur.roles.name === 'admin');
  if (isAdmin) return true;
  
  // Técnico responsável pode
  if (organizacao.id_tecnico === userId) return true;
  
  return false;
}
```

---

## 17. Regras de Negócio Específicas

### 17.1 Organizações de 2º Grau

```javascript
// Se tem associados PJ, avisar sobre obrigações específicas
function verificarTipoOrganizacao(simNaoPj) {
  if (simNaoPj === 1) {
    return {
      type: 'info',
      message: 'Esta é uma organização de 2º grau (Central, Federação, etc.). Certifique-se de preencher todos os dados dos associados pessoa jurídica.'
    };
  }
  return null;
}
```

### 17.2 Participantes vs Lista de Presença

```javascript
function validarModoParticipantes(participantesMenos10) {
  if (participantesMenos10 === 1) {
    return {
      type: 'info',
      message: 'Cadastre individualmente cada participante (menos de 10 pessoas)'
    };
  } else {
    return {
      type: 'info',
      message: 'Como há mais de 10 participantes, use folha de presença física e tire foto da lista assinada.'
    };
  }
}
```

---

## 18. Debounce e Auto-Save

### 18.1 Configuração de Debounce

```javascript
const DEBOUNCE_CONFIG = {
  'texto-curto': 500,      // campos de texto simples
  'texto-longo': 1000,     // textareas
  'numerico': 300,         // campos numéricos
  'select': 0,             // selects salvam imediatamente
  'checkbox': 0,           // checkboxes salvam imediatamente
};
```

### 18.2 Implementação de Auto-Save

```typescript
import { useCallback } from 'react';
import { debounce } from 'lodash';

function useAutoSave(onSave: (campo: string, valor: any) => Promise<void>) {
  // Diferentes tempos de debounce por tipo de campo
  const debouncedSaveText = useCallback(
    debounce((campo, valor) => onSave(campo, valor), 500),
    [onSave]
  );
  
  const debouncedSaveLongText = useCallback(
    debounce((campo, valor) => onSave(campo, valor), 1000),
    [onSave]
  );
  
  const debouncedSaveNumber = useCallback(
    debounce((campo, valor) => onSave(campo, valor), 300),
    [onSave]
  );
  
  const immediatelySave = useCallback(
    (campo, valor) => onSave(campo, valor),
    [onSave]
  );
  
  return {
    saveText: debouncedSaveText,
    saveLongText: debouncedSaveLongText,
    saveNumber: debouncedSaveNumber,
    saveImmediate: immediatelySave
  };
}
```

---

## 19. Mensagens de Validação Padronizadas

### 19.1 Mensagens em Português

```javascript
const MENSAGENS_VALIDACAO = {
  // Campos obrigatórios
  required: 'Este campo é obrigatório',
  
  // Formatos
  invalidCNPJ: 'CNPJ inválido ou incorreto. Verifique o número digitado.',
  invalidCPF: 'CPF digitado é inválido',
  invalidCEP: 'O CEP deve conter 8 números',
  invalidEmail: 'E-mail inválido',
  invalidPhone: 'Telefone inválido',
  
  // Valores numéricos
  mustBePositive: 'O valor deve ser maior que zero',
  mustBePositiveOrZero: 'O valor deve ser maior ou igual a zero',
  exceedsMaximum: 'Valor excede o máximo permitido',
  
  // Datas
  dateInFuture: 'A data não pode ser no futuro',
  dateTooOld: 'Data muito antiga. Confirme se está correta.',
  
  // Arquivos
  invalidFileType: 'Tipo de arquivo não permitido',
  fileTooLarge: 'Arquivo muito grande',
  
  // Relacionamentos
  municipioNaoDoEstado: 'Este município não pertence ao estado selecionado',
  registroNaoEncontrado: 'Registro não encontrado',
  
  // Consistência
  sumExceedsTotal: 'A soma excede o total informado',
  inconsistentData: 'Dados inconsistentes. Verifique os valores informados.',
};
```

### 19.2 Tipos de Alerta

```typescript
type TipoAlerta = 'error' | 'warning' | 'info' | 'success';

interface Alerta {
  type: TipoAlerta;
  message: string;
  campo?: string;
}
```

**Cores Recomendadas**:
- `error`: vermelho (#d32f2f)
- `warning`: amarelo/laranja (#f57c00)
- `info`: azul (#1976d2)
- `success`: verde (#388e3c)

---

## 20. Validação de Coordenadas GPS

### 20.1 Limites Geográficos do Brasil

```javascript
const LIMITES_BRASIL = {
  latMin: -33.75, // Extremo sul
  latMax: 5.27,   // Extremo norte
  lngMin: -73.99, // Extremo oeste
  lngMax: -34.79  // Extremo leste
};

function validarCoordenadas(lat, lng) {
  if (lat < LIMITES_BRASIL.latMin || lat > LIMITES_BRASIL.latMax) {
    return {
      type: 'warning',
      message: 'Latitude fora dos limites do Brasil. Confirme se está correta.'
    };
  }
  
  if (lng < LIMITES_BRASIL.lngMin || lng > LIMITES_BRASIL.lngMax) {
    return {
      type: 'warning',
      message: 'Longitude fora dos limites do Brasil. Confirme se está correta.'
    };
  }
  
  return null;
}
```

### 20.2 Precisão GPS

```javascript
function verificarPrecisaoGPS(accuracy) {
  if (accuracy > 20) {
    return {
      type: 'warning',
      message: `Precisão GPS baixa (${accuracy.toFixed(0)}m). Para melhor precisão, tente ao ar livre.`
    };
  }
  
  if (accuracy <= 5) {
    return {
      type: 'success',
      message: `Excelente precisão GPS (${accuracy.toFixed(0)}m)`
    };
  }
  
  return null;
}
```

---

## 21. Consistência Entre Tabelas Relacionadas

### 21.1 Arquivos Vinculados

```javascript
async function verificarArquivosOrfaos() {
  // Buscar arquivos sem organização pai
  const query = `
    SELECT a.* 
    FROM pinovara.organizacao_arquivo a
    LEFT JOIN pinovara.organizacao o ON a.id_organizacao = o.id
    WHERE o.id IS NULL
  `;
  
  // Se houver, criar job de limpeza
}
```

### 21.2 Integridade Referencial

```javascript
// Antes de deletar organização, verificar dependências
async function verificarDependenciasOrganizacao(organizacaoId) {
  const dependencias = {
    arquivos: await contarRegistros('organizacao_arquivo', organizacaoId),
    fotos: await contarRegistros('organizacao_foto', organizacaoId),
    producao: await contarRegistros('organizacao_producao', organizacaoId),
    abrangenciaSocios: await contarRegistros('organizacao_abrangencia_socio', organizacaoId),
    abrangenciaPj: await contarRegistros('organizacao_abrangencia_pj', organizacaoId),
    participantes: await contarRegistros('organizacao_participante', organizacaoId),
    indicadores: await contarRegistros('organizacao_indicador', organizacaoId),
  };
  
  const total = Object.values(dependencias).reduce((a, b) => a + b, 0);
  
  if (total > 0) {
    return {
      type: 'warning',
      message: `Esta organização possui ${total} registro(s) relacionado(s). Deseja realmente excluir?`,
      dependencias
    };
  }
  
  return null;
}
```

---

## 22. Validações Específicas de UI/UX

### 22.1 Feedback de Salvamento

```javascript
const ESTADOS_SALVAMENTO = {
  idle: { icon: null, message: '' },
  saving: { icon: 'loading', message: 'Salvando...' },
  saved: { icon: 'check', message: 'Salvo com sucesso', duration: 2000 },
  error: { icon: 'error', message: 'Erro ao salvar', duration: 5000 }
};
```

### 22.2 Confirmações de Ações Destrutivas

```javascript
// Antes de deletar item de repeating group
function confirmarDelecao(tipo, item) {
  const mensagens = {
    'arquivo': `Deseja realmente excluir o arquivo "${item.obs || 'sem descrição'}"?`,
    'producao': `Deseja realmente excluir a produção de "${item.cultura}"?`,
    'abrangencia-socio': `Deseja realmente excluir o município "${item.municipioNome}" (${item.numSocios} sócios)?`,
    'abrangencia-pj': `Deseja realmente excluir "${item.razaoSocial}"?`,
    'foto': `Deseja realmente excluir esta foto?`,
    'participante': `Deseja realmente excluir "${item.nome}"?`,
  };
  
  return window.confirm(mensagens[tipo] || 'Deseja realmente excluir?');
}
```

---

## 23. Validações de Segurança

### 23.1 SQL Injection Prevention

```typescript
// Backend: SEMPRE usar Prisma ORM, nunca raw queries com inputs do usuário
// Prisma já previne SQL injection automaticamente

// ❌ NUNCA FAZER:
await prisma.$executeRaw`SELECT * FROM organizacao WHERE nome = '${nomeDoUsuario}'`;

// ✅ SEMPRE FAZER:
await prisma.organizacao.findMany({
  where: { nome: nomeDoUsuario }
});
```

### 23.2 XSS Prevention

```typescript
// Frontend: React já escapa automaticamente, mas para dangerouslySetInnerHTML:
import DOMPurify from 'dompurify';

function sanitizarHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}
```

### 23.3 File Upload Security

```typescript
// Backend: validar tipo de arquivo pelo conteúdo, não só extensão
import fileType from 'file-type';

async function validarArquivoUpload(buffer: Buffer, mimeTypeDeclarado: string) {
  const tipoReal = await fileType.fromBuffer(buffer);
  
  if (!tipoReal) {
    throw new Error('Tipo de arquivo não reconhecido');
  }
  
  if (tipoReal.mime !== mimeTypeDeclarado) {
    throw new Error('Tipo de arquivo não corresponde ao declarado');
  }
  
  const tiposPermitidos = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    // ...
  ];
  
  if (!tiposPermitidos.includes(tipoReal.mime)) {
    throw new Error('Tipo de arquivo não permitido');
  }
  
  return true;
}
```

---

## 24. Testes de Validação Recomendados

### 24.1 Casos de Teste para CNPJ

```javascript
const TESTES_CNPJ = [
  { cnpj: '11222333000181', esperado: true, descricao: 'CNPJ válido' },
  { cnpj: '11222333000180', esperado: false, descricao: 'DV incorreto' },
  { cnpj: '00000000000000', esperado: false, descricao: 'Sequência proibida' },
  { cnpj: '1122233300018', esperado: false, descricao: 'Menos de 14 dígitos' },
  { cnpj: '112223330001811', esperado: false, descricao: 'Mais de 14 dígitos' },
];
```

### 24.2 Casos de Teste para Características

```javascript
const TESTES_CARACTERISTICAS = [
  {
    dados: { nTotalSocios: 100, nTotalSociosCaf: 80, nDistintosCaf: 75 },
    esperado: { valido: true },
    descricao: 'Dados consistentes'
  },
  {
    dados: { nTotalSocios: 100, nTotalSociosCaf: 120 },
    esperado: { valido: false, erro: 'CAF > Total' },
    descricao: 'CAF maior que total'
  },
  {
    dados: { nTotalSocios: 100, nDistintosCaf: 110 },
    esperado: { valido: false, erro: 'Distintos > Total' },
    descricao: 'Distintos maior que total'
  },
];
```

---

## 25. Validações de Performance

### 25.1 Limites de Repeating Groups

```javascript
const LIMITES_REPEATING = {
  arquivos: 50,           // Máximo 50 arquivos por organização
  producao: 100,          // Máximo 100 culturas
  abrangenciaSocios: 5570, // Todos os municípios do Brasil
  abrangenciaPj: 1000,    // Máximo 1000 organizações filiadas
  fotos: 200,             // Máximo 200 fotos
  participantes: 100,     // Máximo 100 participantes individuais
};

function validarLimiteRepeating(tipo, quantidadeAtual) {
  const limite = LIMITES_REPEATING[tipo];
  
  if (quantidadeAtual >= limite) {
    return {
      type: 'error',
      message: `Limite máximo de ${limite} itens atingido`
    };
  }
  
  if (quantidadeAtual >= limite * 0.9) {
    return {
      type: 'warning',
      message: `Atenção: ${quantidadeAtual} de ${limite} itens cadastrados`
    };
  }
  
  return null;
}
```

---

## 26. Resumo de Implementação

### 26.1 Prioridade de Validações

| Prioridade | Validação | Local | Quando |
|------------|-----------|-------|--------|
| **CRÍTICA** | CNPJ/CPF | Frontend + Backend | Sempre |
| **CRÍTICA** | Campos obrigatórios | Frontend + Backend | Antes de salvar |
| **ALTA** | Constraints numéricos | Frontend + Backend | Em tempo real |
| **ALTA** | Foreign keys | Backend | Antes de salvar |
| **MÉDIA** | Consistência de totais | Frontend | Em tempo real (avisos) |
| **MÉDIA** | Limites de caracteres | Frontend | Durante digitação |
| **BAIXA** | Completude de seções | Frontend | Para relatórios |
| **BAIXA** | Sugestões de preenchimento | Frontend | Após preencher |

### 26.2 Checklist de Implementação

Para cada campo/seção implementada:

- [ ] Validação frontend implementada
- [ ] Validação backend implementada
- [ ] Mensagens de erro em português
- [ ] Feedback visual adequado
- [ ] Testes unitários criados
- [ ] Testes de integração criados
- [ ] Documentação atualizada
- [ ] Testado com dados reais do ODK

---

## Observações Finais

1. **Validação Dupla**: Sempre validar no frontend (UX) E no backend (segurança)

2. **Mensagens Claras**: Usar português claro e objetivo, sem jargão técnico

3. **Feedback Imediato**: Validar em tempo real quando possível, sem esperar submit

4. **Avisos vs Erros**: 
   - Erros bloqueiam salvamento
   - Avisos permitem salvamento mas alertam o usuário
   - Infos são apenas orientações

5. **Consistência**: Manter mesmo padrão de validação em todo o sistema

6. **Acessibilidade**: Mensagens de erro devem ser acessíveis via screen readers

7. **Logs**: Registrar erros de validação no backend para análise posterior
