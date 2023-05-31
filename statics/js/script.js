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
document.getElementById("flexRadioDefault2").addEventListener("change",carregarModal)
document.getElementById("flexRadioDefault1").addEventListener("change",carregarModal)
document.querySelector("#consumo").addEventListener("keyup", atualizarModal)

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
	let consumo = document.querySelector("#consumo").value
	let faixas_obrigatorias = document.querySelectorAll(".obrigatorio")
	let todas_true = true
	let valores_das_faixas = []
	let qtd_faixas = 4

	faixas_obrigatorias.forEach(function(valor){
		if(verificarFloat(valor.value)==false){
			todas_true = false
			valor.classList.add("is-invalid")
		}else{
			valores_das_faixas.push(parseFloat(valor.value))
			valor.classList.remove("is-invalid")
		}
	})

	consumo = verificarFloat(consumo)


	if (consumo==false){
		document.querySelector("#consumo").classList.add("is-invalid")
	}else{
		document.querySelector("#consumo").classList.remove("is-invalid")
	}

	if(consumo==false || todas_true==false){
		return
	}

	if(document.getElementById("flexRadioDefault2").checked){
		qtd_faixas = 5
	}



	const mes_dict = {
		id: id_temp,
		consumo,
		valor: valorTotal(valores_das_faixas, consumo),
		mes_nome: meses_nome[mes_selecionado-1],
		mes_id: mes_selecionado,
		ano: anoSelecionado,
		ano_mes: meses_nome[mes_selecionado-1]+"/"+anoSelecionado,
		valores_das_faixas,
		qtd_faixas
	}
	registro_meses.push(mes_dict)

	document.querySelectorAll(".valor-m3").forEach(function(input){
		input.value = ""
	})
	
	
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
		<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick='carregarModal()'>
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
			<span>Consumo em litros: ${(informacoes.consumo*1000).toFixed(2)}L</span>
			<br>
			<span>Consumo em m³: ${informacoes.consumo.toFixed(2)}m³</span>
			<br>
			<span>Total pago: R$${informacoes.valor.toFixed(2)}</span>
		</p>
		<p class="card-text">
			<h6 class="card-title">Comparação Mês x Ano:</h6>
			<span>Média anual de consumo: ${(media_anual*1000).toFixed(2)}L</span>
			<br>
			<span>Média anual de consumo em m³: ${(media_anual).toFixed(2)}m³</span>
			<br>
			<span>Consumo mensal em relação ao consumo anual: ${mediaMaiorMenor(media_anual, informacoes)}</span>
		</p>
		<p class="card-text tabela-faixa">
			<h6 class="card-title">Valor pago por faixa:</h6>
			${valorDeFaixa(informacoes)}
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
	let temp = document.querySelector('.meses-card')
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
        document.querySelector(".meses-card").innerHTML += gerarCard(mes, ano_anterior)
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
				<span>Média anual de consumo: ${(media_anual).toFixed(2)}m³</span>
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
				<span>Consumo em litros: ${(informacoes.consumo*1000).toFixed(2)}L</span>
				<br>
				<span>Consumo em m³: ${(informacoes.consumo).toFixed(2)}m³</span>
				<br>
				<span>Total pago: R$${informacoes.valor.toFixed(2)}</span>
			</p>
			<p class="card-text">
				<h6 class="card-title">Comparação Mês x Ano:</h6>
				<span>Consumo mensal em relação ao consumo anual: ${mediaMaiorMenor(media_anual, informacoes)}</span>
			</p>
			<p class="card-text tabela-faixa">
				<h6 class="card-title">Valor pago por faixa:</h6>
				${valorDeFaixa(informacoes)}
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

function carregarModal() { 
	let modal_faixas = document.getElementById("input-faixas")
	let opcao1 = document.getElementById("flexRadioDefault1")
	let opcao2 = document.getElementById("flexRadioDefault2")
	let qtd_inpt = 4
	let faixas = []
	if (opcao1.checked){
		qtd_inpt = 4
		faixas = ["0 a 10", "11 a 20", "21 a 50", "acima de 50"]
	}else if(opcao2.checked){
		qtd_inpt = 5
		faixas = ["0 a 10", "11 a 20", "21 a 30", "31 a 50","acima de 50"]
	}
	modal_faixas.innerHTML = ""
	for (let i = 0; i < qtd_inpt; i++) {
		modal_faixas.innerHTML +=`<div class="col-12 mb-1">
			<label id="titulo${i}" for="colFormLabelSm" class="col-sm-12 col-form-label col-form-label-sm"></label>
			<div class="input-group mb-2 mr-sm-2">
				<div class="input-group-prepend">
				<div class="input-group-text">R$</div>
				</div>
				<input id="valor${i}" type="text" class="form-control valor-m3" disabled placeholder="Valor do m³ para ${faixas[i]} m³ de água" aria-label="valor">
			</div>
			
		</div>`
		if(i==0){
			document.getElementById(`valor${i}`).classList.add("obrigatorio")
			document.getElementById(`titulo${i}`).innerHTML = `Valor fixo para ${faixas[i]}m³ (obrigatório)`
			document.getElementById(`valor${i}`).disabled = false
		}
	}
	atualizarModal()
}

function atualizarModal(){
	let consumo = document.querySelector("#consumo").value
	let consumo_float = verificarFloat(consumo)
	let faixas = []

	

	if (document.getElementById("flexRadioDefault1").checked){
		faixas = ["0 a 10", "11 a 20", "21 a 50", "50 ou mais "]
	}else{
		faixas = ["0 a 10", "11 a 20", "21 a 30", "31 a 50","50 ou mais "]
	}

	for (let i = 1; i < faixas.length; i++) {
		document.getElementById(`titulo${i}`).innerHTML = `Valor do m³ para ${faixas[i]}m³`
		document.getElementById(`valor${i}`).classList.add("opcional")
		document.getElementById(`valor${i}`).disabled = true
		document.getElementById(`valor${i}`).classList.remove("obrigatorio")
	}


	if(consumo_float != false) {
		consumo = parseFloat(consumo)
		let indexs = valoresRequeridos(consumo)
		for (let i = 1; i < indexs+1; i++) {
			document.getElementById(`valor${i}`).classList.remove("opcional")
			document.getElementById(`valor${i}`).classList.add("obrigatorio")
			document.getElementById(`titulo${i}`).innerHTML = `Valor do m³ para ${faixas[i]}m³ (obrigatório)`
			document.getElementById(`valor${i}`).disabled = false
		}
		
	}

	document.querySelectorAll(".opcional").forEach(function(inp){
		inp.classList.remove("is-invalid")
	})
}


function valoresRequeridos(consumo) {
	let valores = null
	
	if(consumo >= 0 && consumo <= 10){
		valores = 0
	}else if (consumo >= 11 && consumo <= 20){
		valores = 1
	}

	if (document.getElementById("flexRadioDefault1").checked){
		if (consumo >= 21 && consumo <= 50){
			valores = 2
		}else if (consumo >= 51){
			valores = 3
		}
	}else{
		if (consumo >= 21 && consumo <= 30){
			valores = 2
		}else if (consumo >= 31 && consumo <= 50){
			valores = 3
		}else if (consumo >= 51){
			valores = 4
		}
	}
	return valores

}

function valorTotal(valores, consumo){
	let total = 0
	if(valores.length == 1){
		total = valores[0]
	}else if(valores.length == 2){
		total = valores[0]+((consumo-10)*valores[1])
	}else if(valores.length >= 3){
		if (document.getElementById("flexRadioDefault1").checked){
			if (valores.length == 3){
				total = valores[0]+(10*valores[1])+((consumo-20)*valores[2])
			}else if (valores.length == 4){
				total = valores[0]+(10*valores[1])+(30*valores[2])+((consumo-50)*valores[3])
			}
		}else{
			if (valores.length == 3){
				total = valores[0]+(10*valores[1])+((consumo-20)*valores[2])
			}else if (valores.length == 4){
				total = valores[0]+(10*valores[1])+(10*valores[2])+((consumo-30)*valores[3])
			}else if (valores.length == 5){
				total = valores[0]+(10*valores[1])+(10*valores[2])+(20*valores[3])+((consumo-50)*valores[4])
			}
		}
	}
	return total
}

function valorDeFaixa(informacoes){
	let tabela_faixas = ''
	let faixas = []
	if (informacoes.qtd_faixas == 4){
		faixas = ["0 a 10", "11 a 20", "21 a 50", "acima de 50"]
	}else if(informacoes.qtd_faixas == 5){
		faixas = ["0 a 10", "11 a 20", "21 a 30", "31 a 50","acima de 50"]
	}

	for(let i=0; i<informacoes.valores_das_faixas.length;i++){
		if(i==0){
			tabela_faixas +=`<span>Valor fixo (${faixas[i]}m³): R$${informacoes.valores_das_faixas[i].toFixed(2)}</span><br>`
		}else{
			tabela_faixas +=`<span>Valor de ${faixas[i]}m³: R$${informacoes.valores_das_faixas[i].toFixed(2)}</span><br>`
		}
	}
	return tabela_faixas
}