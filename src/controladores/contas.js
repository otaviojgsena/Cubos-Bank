let bancodedados = require('../bancodedados.js');
let registradorDeNumeroDeContas = 1;
let indiceEncontrado = 0;

const validarSenha = (senha, index, res) => {
    if (bancodedados.contas[index].usuario.senha !== senha) {
        return res.status(401).json({ mensagem: "A senha está incorreta" });
    };
};

const validarReqTipoUm = (nome, cpf, data_nascimento, telefone, email, senha, res) => {
    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ mensagem: "Todos os campos são obrigatórios" });
    };
};

const validarReqTipoDois = (numero_conta, senha, res) => {
    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: "O número da conta e a senha são requisitos obrigatórios" });
    };
};

const encontrarConta = (numero_conta, res) => {
    indiceEncontrado = bancodedados.contas.findIndex((conta) => {
        return conta.numero === numero_conta;
    });

    if (indiceEncontrado === -1) {
        return res.status(404).json("O número da conta informado não consta em nosso banco de dados");
    };
};

const cadastrarContas = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
    validarReqTipoUm(nome, cpf, data_nascimento, telefone, email, senha, res);

    const cpfEncontrado = bancodedados.contas.find((conta) => {
        return conta.usuario.cpf === cpf;
    });

    if (cpfEncontrado) {
        return res.status(400).json(`Já existe uma conta com o cpf: ${cpfEncontrado.usuario.cpf}!`);
    };

    const emailEncontrado = bancodedados.contas.find((conta) => {
        return conta.usuario.email === email;
    });

    if (emailEncontrado) {
        return res.status(400).json(`Já existe uma conta com o email: ${emailEncontrado.usuario.email}!`);
    };

    const numero = registradorDeNumeroDeContas.toString();
    const saldo = 0;

    const novaConta = {
        numero,
        saldo,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    };
    registradorDeNumeroDeContas++;
    bancodedados.contas.push(novaConta);
    return res.status(201).json();

};

const listarContas = (req, res) => {
    const senha_banco = req.query.senha_banco;
    if (!senha_banco) {
        return res.status(400).json({ mensagem: "A senha do banco deve ser informada" });
    };

    if (senha_banco === bancodedados.banco.senha) {
        return res.status(200).json(bancodedados.contas);
    }
    else {
        return res.status(403).json({ mensagem: 'A senha informada é inválida' });
    }

};

const deletarConta = (req, res) => {
    const { numero_conta } = req.params;
    encontrarConta(numero_conta, res);
    if (bancodedados.contas[indiceEncontrado].saldo !== 0) {
        return res.status(400).json("A conta só poderá ser excluída quando saldo estiver zerado");
    };
    bancodedados.contas.splice(indiceEncontrado, 1);
    return res.status(204).json();
};

const depositarEmUmaContaBancaria = (req, res) => {
    const { numero_conta, valor } = req.body;

    if (!numero_conta || !valor) {
        return res.status(400).json({ mensagem: "O número da conta e o valor são obrigatórios" });
    };

    const valorDepositoEmNumero = Number(valor);
    encontrarConta(numero_conta, res);

    if (valorDepositoEmNumero <= 0) {
        return res.status(400).json({ mensagem: " Não depositamos valores que sejam iguais ou menores a zero " });
    };
    bancodedados.contas[indiceEncontrado].saldo += valorDepositoEmNumero;

    const date = new Date();
    const date2 = Date.now();
    const hoje = new Date(date2);
    const data = hoje.toUTCString();

    const depositos = {
        data,
        numero_conta,
        valor
    };

    bancodedados.depositos.push(depositos);
    return res.status(204).json();
};

const atualizarUsuario = (req, res) => {

    const { numeroConta } = req.params;
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
    encontrarConta(numeroConta, res)
    validarReqTipoUm(nome, cpf, data_nascimento, telefone, email, senha, res)
    validarSenha(senha, indiceEncontrado, res);

    bancodedados.contas[indiceEncontrado].usuario.nome = nome;
    bancodedados.contas[indiceEncontrado].usuario.cpf = cpf;
    bancodedados.contas[indiceEncontrado].usuario.data_nascimento = data_nascimento;
    bancodedados.contas[indiceEncontrado].usuario.telefone = telefone;
    bancodedados.contas[indiceEncontrado].usuario.email = email;

    return res.status(204).json();
};

const sacarDeUmaContaBancaria = (req, res) => {
    const { numero_conta, valor, senha } = req.body;
    const valorSaqueEmNumero = Number(valor);

    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({ mensagem: "O número da conta, o valor e a senha são obrigatórios" })
    };

    if (valorSaqueEmNumero <= 0) {

        return res.status(400).json({ mensagem: " O valor não pode ser menor que zero " })

    };

    encontrarConta(numero_conta, res);
    validarSenha(senha, indiceEncontrado, res);

    if (bancodedados.contas[indiceEncontrado].saldo < valorSaqueEmNumero) {
        return res.status(400).json({ mensagem: "A conta não possui saldo suficiente para esse saque" })
    };

    const date = new Date();
    const date2 = Date.now();
    const hoje = new Date(date2);
    const data = hoje.toUTCString();

    const teste = {
        data,
        numero_conta,
        valor
    };

    bancodedados.saques.push(teste);
    if (bancodedados.contas[indiceEncontrado].saldo >= valorSaqueEmNumero) {
        bancodedados.contas[indiceEncontrado].saldo = bancodedados.contas[indiceEncontrado].saldo - valorSaqueEmNumero
        return res.status(204).json()
    };

};

const transferirParaOutraConta = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;
    const valorEmNumero = Number(valor);

    if (!numero_conta_origem | !numero_conta_destino | !valor || !senha) {
        return res.status(400).json({ mensagem: "O número da conta origem, da conta destino, o valor e a senha são obrigatórios" });
    };

    const indiceContaOrigem = bancodedados.contas.findIndex((conta) => {
        return conta.numero === numero_conta_origem;
    });

    const indiceContaDestino = bancodedados.contas.findIndex((conta) => {
        return conta.numero === numero_conta_destino;
    });

    validarSenha(senha, indiceContaOrigem, res);

    if (indiceContaOrigem === -1) {
        return res.status(404).json({ mensagem: " A conta de origem não foi encontrada " });
    };

    if (indiceContaDestino === -1) {
        return res.status(404).json({ mensagem: " A conta de destino não foi encontrada " });
    };

    if (valorEmNumero > bancodedados.contas[indiceContaOrigem].saldo) {
        return res.status(400).json({ mensagem: " A conta de origem não possui saldo suficiente " });
    };
    bancodedados.contas[indiceContaOrigem].saldo -= valorEmNumero;
    bancodedados.contas[indiceContaDestino].saldo += valorEmNumero;
    const date = new Date();
    const date2 = Date.now();
    const hoje = new Date(date2);
    const data = hoje.toUTCString();

    let registro = {
        data,
        numero_conta_origem,
        numero_conta_destino,
        valor
    };

    bancodedados.transferencias.push(registro);
    return res.status(204).json();

};

const exibirSaldo = (req, res) => {

    const numeroConta = req.query.numero_conta;
    const senha = req.query.senha;
    validarReqTipoDois(numeroConta, senha, res);
    encontrarConta(numeroConta, res);
    validarSenha(senha, indiceEncontrado, res);

    return res.status(200).json({ saldo: `${bancodedados.contas[indiceEncontrado].saldo}` });
};

const exibirExtrato = (req, res) => {
    const numeroConta = req.query.numero_conta;
    const senha = req.query.senha;

    validarReqTipoDois(numeroConta, senha, res);
    encontrarConta(numeroConta, res);
    validarSenha(senha, indiceEncontrado, res);

    let depositos = [];
    let saques = [];
    let transferenciasEnviadas = [];
    let transferenciasRecebidas = [];

    for (let index = 0; index < bancodedados.depositos.length; index++) {
        if (bancodedados.depositos[index].numero_conta === numeroConta) {
            depositos.push(bancodedados.depositos[index]);
        };
    };

    for (let index = 0; index < bancodedados.saques.length; index++) {
        if (bancodedados.saques[index].numero_conta === numeroConta) {
            saques.push(bancodedados.saques[index]);
        };
    };

    for (let index = 0; index < bancodedados.transferencias.length; index++) {
        if (bancodedados.transferencias[index].numero_conta_origem === numeroConta) {
            transferenciasEnviadas.push(bancodedados.transferencias[index]);
        };
    };

    for (let index = 0; index < bancodedados.transferencias.length; index++) {
        if (bancodedados.transferencias[index].numero_conta_destino === numeroConta) {
            transferenciasRecebidas.push(bancodedados.transferencias[index]);
        }
    };

    let extratos = {
        depositos,
        saques,
        transferenciasEnviadas,
        transferenciasRecebidas
    };

    return res.status(200).json(extratos);
};

module.exports = {
    cadastrarContas,
    listarContas,
    deletarConta,
    depositarEmUmaContaBancaria,
    atualizarUsuario,
    sacarDeUmaContaBancaria,
    transferirParaOutraConta,
    exibirSaldo,
    exibirExtrato
};