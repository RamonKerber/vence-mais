CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL
);

CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao VARCHAR(255)
);

CREATE TABLE fornecedores (
    id_fornecedor SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(150)
);

CREATE TABLE produtos (
    id_produto SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao VARCHAR(255),

    id_categoria INT NOT NULL,
    id_fornecedor INT NOT NULL,

    CONSTRAINT fk_produto_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
        ON DELETE RESTRICT,

    CONSTRAINT fk_produto_fornecedor
        FOREIGN KEY (id_fornecedor)
        REFERENCES fornecedores(id_fornecedor)
        ON DELETE RESTRICT
);

CREATE TABLE lotes (
    id_lote SERIAL PRIMARY KEY,

    id_produto INT NOT NULL,

    quantidade INT NOT NULL CHECK (quantidade >= 0),
    preco DECIMAL(10,2) NOT NULL CHECK (preco >= 0),
    data_validade DATE NOT NULL,

    CONSTRAINT fk_lote_produto
        FOREIGN KEY (id_produto)
        REFERENCES produtos(id_produto)
        ON DELETE RESTRICT
);

CREATE TABLE descartes (
    id_descarte SERIAL PRIMARY KEY,

    id_lote INT NOT NULL,

    quantidade_descartada INT NOT NULL
        CHECK (quantidade_descartada > 0),

    data_descarte DATE NOT NULL,
    motivo VARCHAR(255) NOT NULL,

    CONSTRAINT fk_descarte_lote
        FOREIGN KEY (id_lote)
        REFERENCES lotes(id_lote)
        ON DELETE RESTRICT
);

CREATE INDEX idx_produto_nome
ON produtos(nome);

CREATE INDEX idx_lote_validade
ON lotes(data_validade);

CREATE INDEX idx_descarte_data
ON descartes(data_descarte);

CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
    id_movimentacao SERIAL PRIMARY KEY,

    id_lote INT NOT NULL,

    quantidade INT NOT NULL
        CHECK (quantidade > 0),

    tipo VARCHAR(30) NOT NULL
        CHECK (tipo IN ('VENDA', 'CONSUMO', 'OUTROS')),

    data_movimentacao DATE NOT NULL,

    CONSTRAINT fk_movimentacao_lote
        FOREIGN KEY (id_lote)
        REFERENCES lotes(id_lote)
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_movimentacao_lote
ON movimentacoes_estoque(id_lote);