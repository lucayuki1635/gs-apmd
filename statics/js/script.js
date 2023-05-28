const anoAtual = new Date().getFullYear()
const mesAtual = new Date().getMonth() + 1
let anoCalendario = document.getElementById('ano')
let meses = document.querySelectorAll('.mes')
let registro_meses = []
let id_temp = null
let anoSelecionado = anoAtual
let ultimo_index = 0
anoCalendario.innerText = anoAtual
let meses_nome = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Novembro', 'Outubro', 'Dezembro']
let mes_selecionado = null

window.addEventListener("load", ()=> {
  registro_meses = JSON.parse(localStorage.getItem("registro_meses")) || []

})

document.getElementById('ano-anterior-btn').addEventListener('click', voltarAno)
document.getElementById('ano-posterior-btn').addEventListener('click', avancarAno)
document.querySelector("#salvar").addEventListener("click", cadastar)


function avancarAno(){
    anoSelecionado++
    limparSelecaoMes()
    atualizarAno(anoSelecionado)
    verificarMesesFuturos(anoSelecionado)
    desativarDropdownMes()
    
  }

function voltarAno(){
    anoSelecionado--
    limparSelecaoMes()
    atualizarAno(anoSelecionado)
    verificarMesesFuturos(anoSelecionado)
    desativarDropdownMes()
}


meses.forEach(function(mes) {
  mes.addEventListener('click', function() {
    if (!this.classList.contains('mes-futuro')) {
      if (this.classList.contains('selecionado')) {
        this.classList.remove('selecionado')
      } else {
        limparSelecaoMes();
        this.classList.add('selecionado')
        mes_selecionado = parseInt(document.querySelector(".selecionado").id)
      }
    }
  })
})

function atualizarAno(ano) {
    anoCalendario.innerText = ano
}

function verificarMesesFuturos(ano) {
    meses.forEach(function(mes) {
    if (ano > anoAtual || (ano === anoAtual && mes.id> mesAtual)) {
        mes.classList.add('mes-futuro');
        mes.classList.remove('selecionado')
    } else {
        mes.classList.remove('mes-futuro')
    }
  })
}

function limparSelecaoMes() {
meses.forEach(function(mes) {
    mes.classList.remove('selecionado')
})
}



function ativarDropdownMes(id_mes) {
  if(document.getElementById(id_mes).classList.contains('mes-futuro') == true) {
    return
  }
  let dadosMes = document.getElementById('dadosMes');
  if (dadosMes.classList.contains('show') && ultimo_index == id_mes) {
    dadosMes.classList.remove('show');
  } else {
    dadosMes.classList.add('show');
    id_temp = id_mes + '_'+ anoSelecionado
    let teste = registro_meses.find(mes_dict => mes_dict.id === id_temp)
    if(teste==undefined){
      dadosMes.innerHTML = `<div class="container mt-2 mb-2">
      <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
        Cadastrar Consumo
      </button>
      </div>`
    }else{
      updateDropdownMes(teste)
    }
    
  }
  
  ultimo_index = id_mes
}

function desativarDropdownMes(){
  let dadosMes = document.getElementById('dadosMes')
  if(dadosMes.classList.contains('show')){
    dadosMes.classList.remove('show')
  }
}

function updateDropdownMes(informacoes){
  let dadosMes = document.getElementById('dadosMes');
  console.log(parseFloat(informacoes.consumo))
  dadosMes.innerHTML =`
  <div class="card w-100">
    <div class="card-body">
      <h5 class="card-title">${informacoes.mes_nome}/${anoSelecionado}</h5>
      <p class="card-text">Consumo em litros: ${informacoes.consumo}L</p>
      <p class="card-text">Consumo em m³: ${informacoes.consumo/1000}m³</p>
      <p class="card-text">Valor do m³: R$${informacoes.valor.toFixed(2)}</p>
      <p class="card-text">Total pago: R$${((informacoes.consumo/1000)*informacoes.valor).toFixed(2)}</p>
      <a href="#" class="btn btn-primary" onClick='desativarDropdownMes(); limparSelecaoMes()'>Fechar</a>
      <a href="#" class="btn btn-danger" onClick='apagar(${informacoes.id})'><i class="bi bi-trash3-fill"></i></i></a>
    </div>
  </div>
`
}


function cadastar(){
  const modal = bootstrap.Modal.getInstance(document.querySelector("#exampleModal"))
  let valor = document.querySelector("#valor").value
  let consumo = document.querySelector("#consumo").value

  consumo = verificarFloat(consumo)
  valor = verificarFloat(valor)

  if (valor==false){
    document.querySelector("#valor").classList.add("is-invalid")
  }else{
    document.querySelector("#valor").classList.remove("is-invalid")
  }

  if (consumo==false){
    document.querySelector("#consumo").classList.add("is-invalid")
  }else{
    document.querySelector("#consumo").classList.remove("is-invalid")
  }

  if(consumo==false || valor==false){
    return
  }

  const mes_dict = {
      id: id_temp,
      consumo,
      valor,
      mes_nome: meses_nome[mes_selecionado-1]
  }




  
  registro_meses.push(mes_dict)

  document.querySelector("#valor").value = ''
  document.querySelector("#consumo").value = ''
  
  salvar()
  updateDropdownMes(mes_dict)

  modal.hide()
}

function salvar(){
  localStorage.setItem("registro_meses", JSON.stringify(registro_meses))
}

function concluir(id){
  let mes_encontrado = registro_meses.find(mes_dict => mes_dict.id == id)
  mes_encontrado.concluida = true
  salvar()
}

function apagar(id){
  registro_meses = registro_meses.filter(mes_dict=> mes_dict.id != id)
  salvar()
}


function verificarFloat(valor){
  let converter_float = parseFloat(valor)
  if(isNaN(converter_float)){
    return false
  }else{
    return converter_float
  }
}

verificarMesesFuturos(anoSelecionado)
