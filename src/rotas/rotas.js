const express = require('express');
const { builtinModules } = require('module');
const { cadastrarContas, listarContas, deletarConta, depositarEmUmaContaBancaria, atualizarUsuario, sacarDeUmaContaBancaria, transferirParaOutraConta, exibirSaldo, exibirExtrato } = require('../controladores/contas');

const roteador = express();


roteador.post("/contas", cadastrarContas);
roteador.get("/contas", listarContas);
roteador.delete("/contas/:numero_conta", deletarConta);
roteador.post("/transacoes/depositar", depositarEmUmaContaBancaria);
roteador.put("/contas/:numeroConta/usuario", atualizarUsuario);
roteador.post("/transacoes/sacar", sacarDeUmaContaBancaria);
roteador.post("/transacoes/transferir", transferirParaOutraConta);
roteador.get("/contas/saldo", exibirSaldo);
roteador.get("/contas/extrato", exibirExtrato);

module.exports = roteador;