export type GerenteLogado = {
  id: string;
  nome: string;
  usuario: string;
  empresa_id: string;
  empresa_nome?: string;
};

export type EntregadorLogado = {
  id: string;
  nome: string;
  usuario: string;
  filial_id: string | null;
  empresa_id: string | null;
  gerente_id: string | null;
};

export function salvarGerente(gerente: GerenteLogado) {
  localStorage.setItem("gerente", JSON.stringify(gerente));
}

export function pegarGerente(): GerenteLogado | null {
  const dados = localStorage.getItem("gerente");

  if (!dados) {
    return null;
  }

  return JSON.parse(dados);
}

export function sairGerente() {
  localStorage.removeItem("gerente");
}

export function salvarEntregador(entregador: EntregadorLogado) {
  localStorage.setItem("entregador", JSON.stringify(entregador));
}

export function pegarEntregador(): EntregadorLogado | null {
  const dados = localStorage.getItem("entregador");

  if (!dados) {
    return null;
  }

  return JSON.parse(dados);
}

export function sairEntregador() {
  localStorage.removeItem("entregador");
}