const anoAtual = new Date().getFullYear()
const mesAtual = new Date().getMonth() + 1
let anoCalendario = document.getElementById('ano')
let meses = document.querySelectorAll('.mes')
let registro_meses = []
let id_temp = null
let anoSelecionado = anoAtual
let ultimo_index = 0
let meses_nome = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Novembro', 'Outubro', 'Dezembro']
let mes_selecionado = null
let temporario = []
anoCalendario.innerText = anoAtual


window.addEventListener("load", ()=> {
  registro_meses = JSON.parse(localStorage.getItem("registro_meses")) || []

})

document.getElementById('ano-anterior-btn').addEventListener('click', voltarAno)
document.getElementById('ano-posterior-btn').addEventListener('click', avancarAno)
document.querySelector("#salvar").addEventListener("click", cadastrar)

//TROCA DE ANO
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

function atualizarAno(ano) {
    anoCalendario.innerText = ano
}

//Manipular localStorage
function cadastrar(){
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
		mes_nome: meses_nome[mes_selecionado-1],
		mes_id: mes_selecionado,
		ano: anoSelecionado,
		ano_mes: meses_nome[mes_selecionado-1]+"/"+anoSelecionado
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

function apagar(id){
	registro_meses = registro_meses.filter(mes_dict=> mes_dict.id != id)
	temporario = registro_meses
	let dadosMes = document.getElementById('dadosMes');
	dadosMes.innerHTML = `<div class="container mt-2 mb-2">
		<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
			Cadastrar Consumo
		</button>
		</div>`
	salvar()
	atualizar()
	document.getElementById('busca').value = ''
}

//Dropdown
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
		let mes_encontrado = registro_meses.find(mes_dict => mes_dict.id === id_temp)
		if(mes_encontrado==undefined){
		dadosMes.innerHTML = `<div class="container mt-2 mb-2">
		<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
			Cadastrar Consumo
		</button>
		</div>`
		}else{
		updateDropdownMes(mes_encontrado)
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
	let media_anual =  mediaAnual(anoSelecionado)
	dadosMes.innerHTML =`
	<div class="card w-100">
		<div class="card-body">
		<h5 class="card-title">${informacoes.mes_nome}/${anoSelecionado}</h5>
		<p class="card-text">
		<h6 class="card-title">Informações mensais:</h6>
		<span>Consumo em litros: ${informacoes.consumo}L</span>
		<br>
		<span>Consumo em m³: ${informacoes.consumo/1000}m³</span>
		<br>
		<span>Valor do m³: R$${informacoes.valor.toFixed(2)}</span>
		<br>
		<span>Total pago: R$${((informacoes.consumo/1000)*informacoes.valor).toFixed(2)}</span>
		</p>
		<p class="card-text">
		<h6 class="card-title">Comparação Mês x Ano:</h6>
		<span>Média anual de consumo: ${media_anual.toFixed(2)}L</span>
		<br>
		<span>Média anual de consumo em m³: ${(media_anual/1000).toFixed(2)}m³</span>
		<br>
		<span>Consumo mensal em relação ao consumo anual: ${mediaMaiorMenor(media_anual, informacoes)}</span>
		</p>
		<a href="#" class="btn btn-primary" onClick='desativarDropdownMes(); limparSelecaoMes()'>Fechar</a>
		<a href="#" class="btn btn-danger" onClick='apagar("${informacoes.id}")'><i class="bi bi-trash3-fill"></i></i></a>
		</div>
	</div>
	`
}

//Calculo médias
function mediaAnual(ano){
	let mes_cadastrados = registro_meses.filter(mes => mes.id.includes(ano))
	let soma = mes_cadastrados.reduce((total, valor_soma) => total + valor_soma.consumo, 0)
	let media = soma/mes_cadastrados.length
	return media
}

function mediaMaiorMenor(media_a, informacoes_mes){
	if (media_a > informacoes_mes.consumo){
		let m = (((media_a/informacoes_mes.consumo)-1)*100).toFixed(2)
		return `<span class="baixo-consumo">Abaixo da média em ${m}%</span>`
	}else if (media_a < informacoes_mes.consumo){
		let m = (((informacoes_mes.consumo/media_a)-1)*100).toFixed(2)
		return `<span class="alto-consumo">Acima da média em ${m}% </span>`
	}else{
		return `<span class="consumo-na-media">O mês está na média anual</span>`
	}

}

//Verificadores
function verificarFloat(valor){
	let converter_float = parseFloat(valor)
	if(isNaN(converter_float)){
	  return false
	}else{
	  return converter_float
	}
  }
  

//manipulação botão meses
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


function buscarCalendario(){
	let div_calendario = document.getElementById('calendario')
	let div_busca = document.getElementById('tela-busca')
	div_calendario.classList.toggle('hide-container')
	div_busca.classList.toggle('hide-container')
	registro_meses = JSON.parse(localStorage.getItem("registro_meses")) || []
	temporario = JSON.parse(localStorage.getItem("registro_meses")) || []
	atualizar()
}

function atualizar(){
	let temp = document.querySelector('.teste')
	let ano_anterior =''
    temp.innerHTML = ""
	temporario.sort(function(a, b) {
		if (b.ano !== a.ano) {
		  return b.ano - a.ano
		} else {
		  return a.mes_id - b.mes_id
		}
	  })
	temporario.forEach((mes) => {
        document.querySelector(".teste").innerHTML += gerarCard(mes, ano_anterior)
		ano_anterior = mes.ano
    
    })    
}

document.querySelector('#busca').addEventListener("keyup", ()=>{
    temporario = JSON.parse(localStorage.getItem("registro_meses")) || []
    const filtro = document.querySelector("#busca").value.toLowerCase()
    temporario = temporario.filter(mes => mes.mes_nome.toLowerCase().includes(filtro) || mes.ano.toString().includes(filtro) || mes.ano_mes.toLowerCase().includes(filtro))
    atualizar()
})

function gerarCard(informacoes, ano_anterior){
	let media_anual =  mediaAnual(informacoes.ano)
	let base_hmtl = ``
	if(ano_anterior != informacoes.ano) {
		base_hmtl += `
		<br>
		<div class="centralizar-texto">
			<h3>${informacoes.ano}</h3>
			<div class="alert alert alert-primary tamanho-alerta" role="alert">
				<span>Média anual de consumo: ${media_anual.toFixed(2)}L ou ${(media_anual/1000).toFixed(2)}m³</span>
			</div>
		</div>
		`

	}

	base_hmtl += `
	<br>
	<div class="card w-100">
		<div class="card-body">
			<div class="centralizar-texto">
				<h5 class="card-title">${informacoes.mes_nome}/${informacoes.ano}</h5>
			</div>
			<p class="card-text">
			<h6 class="card-title">Informações mensais:</h6>
			<span>Consumo em litros: ${informacoes.consumo}L</span>
			<br>
			<span>Consumo em m³: ${informacoes.consumo/1000}m³</span>
			<br>
			<span>Valor do m³: R$${informacoes.valor.toFixed(2)}</span>
			<br>
			<span>Total pago: R$${((informacoes.consumo/1000)*informacoes.valor).toFixed(2)}</span>
			</p>
			<p class="card-text">
			<h6 class="card-title">Comparação Mês x Ano:</h6>
			<span>Consumo mensal em relação ao consumo anual: ${mediaMaiorMenor(media_anual, informacoes)}</span>
			</p>
			<a href="#" class="btn btn-danger" onClick='apagar("${informacoes.id}")'><i class="bi bi-trash3-fill"></i></i></a>
		</div>
	</div>
	`

	return base_hmtl
}

function fecharDropdown(){
	document.getElementById("navbarSupportedContent").classList.remove("show")
}

verificarMesesFuturos(anoSelecionado)
