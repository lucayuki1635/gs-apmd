function gerarAno(){
    let listaAnos = ''
  
  for (let ano = 2000; ano <= today.getFullYear(); ano++) {
    listaAnos += '<option>' + ano + '</option>\n'
  }
  
  return listaAnos
}

function gerarMes(){
    let listaMes = ''
  
  for (let mes = 1; mes <= 12; mes++) {
    listaMes += '<option>' + mes + '</option>\n'
  }
  
  return listaMes
}


const anoAtual = new Date().getFullYear()
const mesAtual = new Date().getMonth() + 1

let anoCalendario = document.getElementById('ano')
let anoAnteriorBtn = document.getElementById('ano-anterior-btn')
let anoPosteriorBtn = document.getElementById('ano-posterior-btn')
let meses = document.querySelectorAll('.mes')


anoCalendario.innerText = anoAtual

let anoSelecionado = anoAtual


anoAnteriorBtn.addEventListener('click', voltar_ano)
anoPosteriorBtn.addEventListener('click', avancar_ano)


function avancar_ano(){
    anoSelecionado++
    atualizar_ano(anoSelecionado)
    verificar_meses_futuros(anoSelecionado)
}

function voltar_ano(){
    anoSelecionado--
    atualizar_ano(anoSelecionado)
    verificar_meses_futuros(anoSelecionado)
}

meses.forEach(function(mes) {
    mes.addEventListener('click', function() {
      if (!this.classList.contains('mes-futuro')) {
        limpar_selecao_mes()
        this.classList.add('selecionado')
      }
    });
});

function atualizar_ano(ano) {
    anoCalendario.innerText = ano
}

function verificar_meses_futuros(ano) {
    meses.forEach(function(mes) {

    if (ano > anoAtual || (ano === anoAtual && mes.id> mesAtual)) {
        mes.classList.add('mes-futuro');
        mes.classList.remove('selecionado')
    } else {
        mes.classList.remove('mes-futuro')
    }
});
}

function limpar_selecao_mes() {
meses.forEach(function(mes) {
    mes.classList.remove('selecionado')
})
}

verificar_meses_futuros(anoSelecionado)