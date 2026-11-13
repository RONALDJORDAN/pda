# -*- coding: utf-8 -*-
"""Processa o CSV de alunos e gera um JSON com estatisticas para o sistema de logistica."""
import csv
import json
import os
from collections import Counter, defaultdict

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
CSV_PATH = os.path.join(PROJECT_ROOT, "Dados_base", "alunos.csv")
OUTPUT_PATH = os.path.join(PROJECT_ROOT, "dados.json")


def normalizar_turma(turma):
    """Normaliza nomes de turma para agrupar variantes."""
    t = turma.strip().upper()
    # Padroniza graus
    t = t.replace("º", "").replace("°", "").replace("ª", "")
    # Espacos multiple
    while "  " in t:
        t = t.replace("  ", " ")
    t = t.strip()
    return t


def normalizar_serie(serie):
    """Normaliza nomes de serie para agrupar variantes."""
    s = serie.strip().upper()
    # Padroniza graus
    s = s.replace("º", "").replace("°", "").replace("ª", "")
    # Unifica espaco antes do hífen em variantes integrais
    s = s.replace(" - INTEGRAL", " - INTEGRAL").replace("-INTEGRAL", " - INTEGRAL")
    s = s.replace(" -INTEGRAL", " - INTEGRAL")
    # Remove espacos multiples
    while "  " in s:
        s = s.replace("  ", " ")
    s = s.strip()
    return s


def extrair_serie(turma, curso):
    """Extrai a serie a partir do nome da turma ou curso."""
    # Tenta extrair do curso
    if curso and "ENSINO FUNDAMENTAL" in curso.upper():
        return "ENSINO FUNDAMENTAL"
    if curso and "MÉDIO" in curso.upper():
        return "ENSINO MEDIO"
    if curso and "AEE" in curso.upper():
        return "AEE"
    return "GERAL"


def main():
    with open(CSV_PATH, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f, delimiter=";")
        rows = list(reader)

    # Contadores
    por_escola = Counter()
    por_turma = Counter()
    por_escola_turma = defaultdict(Counter)
    por_turno = Counter()
    por_curso = Counter()
    series = Counter()
    total_alunos = len(rows)

    for r in rows:
        escola = r["Escola"].strip()
        turma = normalizar_turma(r["Turma"])
        curso = r["Curso"].strip()
        turno = r["Turno"].strip()
        serie = normalizar_serie(r["Série"])

        por_escola[escola] += 1
        por_turma[turma] += 1
        por_escola_turma[escola][turma] += 1
        por_turno[turno] += 1
        por_curso[curso] += 1
        series[serie] += 1

    # Monta o JSON de saida
    # Escolas em ordem alfabetica
    escolas_ordenadas = sorted(por_escola.items(), key=lambda x: x[0].upper())

    # Turmas por escola para o dashboard (total de turmas distintas por escola)
    turmas_por_escola = {
        escola: len(turmas)
        for escola, turmas in por_escola_turma.items()
    }

    dados = {
        "total_alunos": total_alunos,
        "total_escolas": len(por_escola),
        "total_turmas": len(por_turma),
        "escolas": [
            {"nome": nome, "quantidade": qty}
            for nome, qty in escolas_ordenadas
        ],
        "turmas_por_escola": [
            {"nome": escola, "quantidade": qty}
            for escola, qty in sorted(turmas_por_escola.items(), key=lambda x: x[0].upper())
        ],
        "turmas": [
            {"nome": nome, "quantidade": qty}
            for nome, qty in por_turma.most_common()
        ],
        "escolas_turmas": {
            escola: [
                {"nome": t, "quantidade": q}
                for t, q in turmas.most_common()
            ]
            for escola, turmas in por_escola_turma.items()
        },
        "turnos": [
            {"nome": nome, "quantidade": qty}
            for nome, qty in por_turno.most_common()
        ],
        "cursos": [
            {"nome": nome, "quantidade": qty}
            for nome, qty in por_curso.most_common()
        ],
        "series": [
            {"nome": nome, "quantidade": qty}
            for nome, qty in series.most_common()
        ],
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(dados, f, ensure_ascii=False, indent=2)

    print(f"Processados {total_alunos} alunos em {len(por_escola)} escolas e {len(por_turma)} turmas.")
    print(f"Arquivo gerado: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()