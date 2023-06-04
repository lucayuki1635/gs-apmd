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
document.getElementById("rangeMetros").addEventListener("change", gerarArrayConsumo)
document.getElementById("rangeReais").addEventListener("change", gerarArrayGasto)
document.querySelector('#busca').addEventListener("keyup",filtroBusca)
document.getElementById("maior-menor-reais").addEventListener("change", filtroBusca)
document.getElementById("maior-menor-metros").addEventListener("change", filtroBusca)

//TROCA DE ANO
function avancarAno(){
    anoSelecionado++
	if (anoSelecionado > 2000){
		document.getElementById('ano-anterior-btn').disabled = false
	}
    limparSelecaoMes()
    atualizarAno(anoSelecionado)
    verificarMesesFuturos(anoSelecionado)
    desativarDropdownMes()
  }

function voltarAno(){
    anoSelecionado--
	if (anoSelecionado == 1){
		document.getElementById('ano-anterior-btn').disabled = true
	}
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
		if(verificarFloatPositivo(valor.value)==false){
			todas_true = false
			valor.classList.add("is-invalid")
		}else{
			valores_das_faixas.push(parseFloat(valor.value))
			valor.classList.remove("is-invalid")
		}
	})

	consumo = verificarFloatPositivo(consumo)


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
	gerarArrayConsumo()
	gerarArrayGasto()
	setMaxInput()
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
	let dadosMes = document.getElementById('dadosMes')
	let media_anual_c =  mediaAnualConsumo(anoSelecionado)
	let media_anual_v = mediaAnualValor(anoSelecionado)
	dadosMes.innerHTML =`
	<div class="card w-100">
		<div class="card-body">
		<h3 class="card-title centralizar-titulos-card-botao">${informacoes.mes_nome}/${anoSelecionado}</h3>
		<hr class="hr" />
		<p class="card-text">
			<h6 class="card-title">Informações mensais:</h6>
			<span>Consumo em litros: ${(informacoes.consumo*1000).toFixed(0)}L</span>
			<br>
			<span>Consumo em m³: ${informacoes.consumo.toFixed(2)}m³</span>
			<br>
			<span>Total pago: R$${informacoes.valor.toFixed(2)}</span>
		</p>
		<hr class="hr" />
		<p class="card-text">
			<h6 class="centralizar-titulos-card-botao">Comparação Mês x Ano:</h6>
			<div class="row">
          		<div class="form-group row">
				  <div class="col-5">
				  	<h6>Consumo água</h6>
					<span>Média anual de consumo em L: ${(media_anual_c*1000).toFixed(0)}L</span>
					<br>
					<span>Média anual de consumo em m³: ${(media_anual_c).toFixed(2)}m³</span>
					<br>
					<span>Consumo de água mês x ano: ${mediaMaiorMenor(media_anual_c, informacoes.consumo)}</span>
				  </div>
				  <div class="col-2 mb-1 centralizar-titulos-card-botao">
					<div class="d-flex" style="max-height: 30rem;">
						<div class="vr"></div>
					</div>
				  </div>
				  <div class="col-5">
				  	<h6>Gasto em reais</h6>
					<span>Média anual de valor pago: R$${(media_anual_v).toFixed(2)}</span>
					<br>
					<span>Valor da conta mês x ano: ${mediaMaiorMenor(media_anual_v, informacoes.valor)}</span>
				  </div>
				</div>
			</div>
		</p>
		<hr class="hr" />
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

function fecharDropdown(){
	document.getElementById("navbarSupportedContent").classList.remove("show")
}

//Calculo médias
function mediaAnualConsumo(ano){
	let mes_cadastrados = registro_meses.filter(mes => mes.id.includes(ano))
	let soma = mes_cadastrados.reduce((total, valor_soma) => total + valor_soma.consumo, 0)
	let media = soma/mes_cadastrados.length
	return media
}

function mediaAnualValor(ano){
	let mes_cadastrados = registro_meses.filter(mes => mes.id.includes(ano))
	let soma = mes_cadastrados.reduce((total, valor_soma) => total + valor_soma.valor, 0)
	let media = soma/mes_cadastrados.length
	return media
}


function mediaMaiorMenor(media_a, consumo_ou_valor){
	if (media_a > consumo_ou_valor){
		let m = (((media_a/consumo_ou_valor)-1)*100).toFixed(2)
		return `<span class="baixo-consumo">Está abaixo da média em ${m}%</span>`
	}else if (media_a < consumo_ou_valor){
		let m = (((consumo_ou_valor/media_a)-1)*100).toFixed(2)
		return `<span class="alto-consumo">Está acima da média em ${m}% </span>`
	}else{
		return `<span class="consumo-na-media">Está na média anual</span>`
	}

}

//Verificadores
function verificarFloatPositivo(valor){
	if(valor.includes(",")){
		return false
	}
	let converter_float = parseFloat(valor)
	if(isNaN(converter_float)){
	  return false
	}else{
		if (converter_float > 0){
			return converter_float
		}
		return false
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
		  mes.classList.add('mes-futuro')
		  mes.classList.remove('selecionado')
		  mes.classList.remove('clicavel')
	  } else {
		  mes.classList.remove('mes-futuro')
		  mes.classList.add('clicavel')
	  }
	})
  }
  
  function limparSelecaoMes() {
	  meses.forEach(function(mes) {
		  mes.classList.remove('selecionado')
	  })
  }


function buscarCalendario(){
	document.getElementById('calendario').classList.toggle('hide-container')
	document.getElementById('tela-busca').classList.toggle('hide-container')
	document.getElementById("maior-menor-reais").value = "1"
	document.getElementById("maior-menor-metros").value = "1"
	document.getElementById("busca").value = ""
	registro_meses = JSON.parse(localStorage.getItem("registro_meses")) || []
	temporario = JSON.parse(localStorage.getItem("registro_meses")) || []
	atualizar()
}

function atualizar(){
	totalizarValores()
	let temp = document.querySelector('.meses-card')
	let ano_anterior =''
    temp.innerHTML = ""
	if (registro_meses.length == 0) {
		temp.innerHTML = '<h1 class="nao-registrado-encontrado">Não há mês registrado</h1>'	
	}else if (registro_meses.length != 0 && temporario.length == 0) {
		temp.innerHTML = '<h1 class="nao-registrado-encontrado">Nenhum mês encontrado</h1>'
	}

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


//Cards
function gerarCard(informacoes, ano_anterior){
	let media_anual_c =  mediaAnualConsumo(anoSelecionado)
	let media_anual_v = mediaAnualValor(anoSelecionado)
	let base_hmtl = ``
	
	if(ano_anterior != informacoes.ano) {
		base_hmtl += `
		<br>
		<h3 class="centralizar-titulos-card-botao">${informacoes.ano}</h3>
		<div class="centralizar-titulos-card-botao">
			
			<div class="alert alert-primary" role="alert">
				<span>Média anual de consumo água: ${(media_anual_c).toFixed(2)}m³</span>
				<br>
				<span>Média anual de valor da conta: R$${(media_anual_v).toFixed(2)}</span>
			</div>
		</div>
		`

	}

	base_hmtl += `
	<br>
	<div class="card w-100">
		<div class="card-body">
		<h3 class="card-title centralizar-titulos-card-botao">${informacoes.mes_nome}/${anoSelecionado}</h3>
		<hr class="hr" />
		<p class="card-text">
			<h6 class="card-title">Informações mensais:</h6>
			<span>Consumo em litros: ${(informacoes.consumo*1000).toFixed(0)}L</span>
			<br>
			<span>Consumo em m³: ${informacoes.consumo.toFixed(2)}m³</span>
			<br>
			<span>Total pago: R$${informacoes.valor.toFixed(2)}</span>
		</p>
		<hr class="hr" />
		<p class="card-text">
			<h6 class="centralizar-titulos-card-botao">Comparação Mês x Ano:</h6>
			<div class="row">
          		<div class="form-group row">
				  <div class="col-5">
				  	<h6>Consumo água</h6>
					<span>Consumo de água mês x ano: ${mediaMaiorMenor(media_anual_c, informacoes.consumo)}</span>
				  </div>
				  <div class="col-2 mb-1 centralizar-titulos-card-botao">
					<div class="d-flex" style="max-height: 30rem;">
						<div class="vr"></div>
					</div>
				  </div>
				  <div class="col-5">
				  	<h6>Gasto em reais</h6>
					<span>Valor da conta mês x ano: ${mediaMaiorMenor(media_anual_v, informacoes.valor)}</span>
				  </div>
				</div>
			</div>
		</p>
		<hr class="hr" />
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

function totalizarValores(){
	let card = document.getElementById("card-total")
	let total_consumo = registro_meses.map(function(objeto){
		return objeto.consumo
	})

	let total_gasto = registro_meses.map(function(objeto){
		return objeto.valor
	})

	if(registro_meses.length > 0){
		total_consumo = total_consumo.reduce((a, b) => a + b).toFixed(2)
		total_gasto = total_gasto.reduce((a, b) => a + b).toFixed(2)
	}else{
		total_consumo = 0
		total_gasto = 0
	}

	let media_total_consumo = registro_meses.reduce((total, valor_soma) => total + valor_soma.consumo, 0)
	media_total_consumo = media_total_consumo/registro_meses.length

	let media_total_valor = registro_meses.reduce((total, valor_soma) => total + valor_soma.valor, 0)
	media_total_valor = media_total_valor/registro_meses.length

	if(registro_meses.length==0){
		media_total_consumo = 0
		media_total_valor = 0
	}

	card.innerHTML = `
	<p class="card-text">
		<div class="row">
			<div class="form-group row">
				<div class="col-5 centralizar-titulos-card-botao">
					<p>
						<span class="informacoes-negrito">Consumo total:</span> <span>${total_consumo}m³</span>
						<br>
						<span class="informacoes-negrito">Valores pagos:</span> <span>R$${total_gasto}</span>
						<br>
						<span class="informacoes-negrito">Número de meses registrados:</span> <span>${registro_meses.length}</span>
					</p>
				</div>
				<div class="col-2 mb-1 centralizar-titulos-card-botao">
				<div class="d-flex" style="height: 5rem;">
					<div class="vr"></div>
				</div>
				</div>
				<div class="col-5 centralizar-titulos-card-botao">
					<p>
						<span class="informacoes-negrito">Média consumo total:</span> <span>${media_total_consumo.toFixed(2)}m³</span>
						<br>
						<span class="informacoes-negrito">Média valores pagos:</span> <span>R$${media_total_valor.toFixed(2)}</span>
						<br>
						<span class="informacoes-negrito">Visualizar meses registrados:</span> <span><a class="mostrar-mais" onclick="buscarCalendario(); fecharDropdown(); gerarArrayConsumo(); gerarArrayGasto(); setMaxInput();" id="concluidas" href="#">Clique aqui</a></span>
					</p>
				</div>
			</div>
		</div>
  	</p>
  `
}


//Modal
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
	let consumo_float = verificarFloatPositivo(consumo)
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


function valorOutput(objeto){
	document.querySelector(`label[for=${objeto.id}]`).querySelector('output').value = parseFloat(objeto.value).toFixed(2)
	filtroBusca()
}

//Filtros
function filtroBusca(){
	const filtro = document.querySelector("#busca").value.toLowerCase()
	let consumo_inpt = document.querySelector(`label[for=rangeMetros]`).querySelector('output')
	let gastos_inpt = document.querySelector(`label[for=rangeReais`).querySelector('output')
	let maior_menor_reais = document.getElementById("maior-menor-reais").value
	let maior_menor_metros = document.getElementById("maior-menor-metros").value
	temporario = JSON.parse(localStorage.getItem("registro_meses")) || []

	if(maior_menor_metros == "1"){
		temporario = temporario.filter(mes => mes.consumo <= parseFloat(consumo_inpt.value))
	}else{
		temporario = temporario.filter(mes => mes.consumo >= parseFloat(consumo_inpt.value))
	}

	if(maior_menor_reais == "1"){
		temporario = temporario.filter(mes => mes.valor.toFixed(2) <= parseFloat(gastos_inpt.value))
	}else{
		temporario = temporario.filter(mes => mes.valor.toFixed(2) >= parseFloat(gastos_inpt.value))
	}
	temporario = temporario.filter(mes => mes.mes_nome.toLowerCase().includes(filtro) || mes.ano.toString().includes(filtro) || mes.ano_mes.toLowerCase().includes(filtro))
	atualizar()

}


function gerarArrayConsumo(){
	let inpt = document.getElementById("rangeMetros")
	let consu = registro_meses.map(function(objeto){
		return objeto.consumo
	})
	if(consu.length == 0){
		inpt.max = "0"
		inpt.disabled = true
	}else if (consu.length == 1){
		inpt.max = Math.max(...consu)
		inpt.disabled = true
	}else{
		inpt.disabled = false
		inpt.max = Math.max(...consu)
	}
	valorOutput(inpt)
	
}

function gerarArrayGasto(){
	let inpt = document.getElementById("rangeReais")
	let valores = registro_meses.map(function(objeto){
		return objeto.valor
	})
	if(valores.length == 0){
		inpt.max = "0"
		inpt.disabled = true
	}else if (valores.length == 1){
		inpt.max = Math.max(...valores)
		inpt.disabled = true
	}else{
		inpt.disabled = false
		inpt.max = Math.max(...valores)
	}
	valorOutput(inpt)
}

function setMaxInput(){
	let inpt = document.getElementById("rangeMetros")
	inpt.value = inpt.max
	valorOutput(inpt)
	let inpt1 = document.getElementById("rangeReais")
	inpt1.value = inpt1.max
	valorOutput(inpt1)
}

verificarMesesFuturos(anoSelecionado)
totalizarValores()