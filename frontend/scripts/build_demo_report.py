"""Create the downloadable fictional report from the same typed content as the page."""

import hashlib
from html import escape
import json
from pathlib import Path
import subprocess

import reportlab
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "frontend/src/assets/evidence"
OUTPUT = ROOT / "output/pdf/protolume-raport-demo.pdf"
PURPLE = colors.HexColor("#5330cc")
INK = colors.HexColor("#151429")
MUTED = colors.HexColor("#484b59")


def main() -> None:
    raw = subprocess.check_output(
        ["node", str(ROOT / "frontend/scripts/demo-report-source.cjs")]
    )
    data = json.loads(raw)
    # Bundled DejaVu Sans covers Polish; redistribution notice is in pdf-fonts.
    fonts = Path(__file__).parent / "pdf-fonts"
    pdfmetrics.registerFont(TTFont("Report", str(fonts / "DejaVuSans.ttf")))
    pdfmetrics.registerFont(TTFont("ReportBold", str(fonts / "DejaVuSans-Bold.ttf")))
    pdfmetrics.registerFontFamily("Report", normal="Report", bold="ReportBold")
    styles = {
        "body": ParagraphStyle(
            "body",
            fontName="Report",
            fontSize=10,
            leading=14,
            textColor=INK,
            spaceAfter=7,
        ),
        "small": ParagraphStyle(
            "small",
            fontName="Report",
            fontSize=8.5,
            leading=11.5,
            textColor=MUTED,
            spaceAfter=4,
        ),
        "title": ParagraphStyle(
            "title",
            fontName="ReportBold",
            fontSize=25,
            leading=29,
            textColor=INK,
            spaceAfter=14,
        ),
        "h1": ParagraphStyle(
            "h1",
            fontName="ReportBold",
            fontSize=20,
            leading=25,
            textColor=INK,
            spaceAfter=13,
        ),
        "h2": ParagraphStyle(
            "h2",
            fontName="ReportBold",
            fontSize=12,
            leading=16,
            textColor=PURPLE,
            spaceBefore=5,
            spaceAfter=4,
        ),
        "status": ParagraphStyle(
            "status",
            fontName="ReportBold",
            fontSize=13,
            leading=18,
            textColor=PURPLE,
            spaceAfter=9,
        ),
        "bullet": ParagraphStyle(
            "bullet",
            fontName="Report",
            fontSize=9.5,
            leading=12,
            textColor=INK,
            leftIndent=10,
            firstLineIndent=-10,
            spaceAfter=3,
        ),
    }
    story = []

    def p(text: str, style: str = "body") -> Paragraph:
        # Keep PDF punctuation portable; source wording remains identical.
        return Paragraph(
            escape(text.replace("—", "-").replace("–", "-")), styles[style]
        )

    def add(text: str, style: str = "body") -> None:
        story.append(p(text, style))

    def bullets(items: list[str]) -> None:
        for item in items:
            add("- " + item, "bullet")

    def section(title: str, items: list[str]) -> None:
        story.append(
            KeepTogether(
                [p(title, "h2"), *[p("- " + item, "bullet") for item in items]]
            )
        )

    add("PROTOLUME / PRZYKŁADOWY RAPORT", "small")
    add(data["title"], "title")
    add(data["fictionalNotice"], "status")
    add(f"Wersja {data['version']} | Data opracowania: {data['preparedOn']}", "small")
    add(data["lead"])
    add(
        f"Opisane scenariusze: {len(data['scenarios'])}. Testy rzeczywistego systemu: nie wykonano.",
        "small",
    )
    story.extend(
        [
            Spacer(1, 7),
            HRFlowable(width="100%", thickness=1, color=PURPLE),
            Spacer(1, 12),
        ]
    )
    summary = data["decisionSummary"]
    add("Streszczenie decyzji", "h2")
    add(summary["status"], "status")
    add(summary["answer"])
    add("Następny krok", "h2")
    add(summary["nextStep"])
    section("Warunki kolejnego etapu", summary["conditions"])
    section("Brakujące informacje", summary["missingInformation"])
    add(
        "Spis treści: 1. Decyzja  |  2. Scenariusze  |  3. Proces i zakres  |  4. Ryzyka i plan",
        "small",
    )
    story.append(PageBreak())

    add("Scenariusze opisane w przykładzie", "h1")
    add(data["scenarioStatusMeaning"], "small")
    add("Pytanie walidacyjne", "h2")
    add(data["validationQuestion"])
    for index, scenario in enumerate(data["scenarios"], 1):
        story.append(
            KeepTogether(
                [
                    p(f"{index}. {scenario['title']}", "h2"),
                    p(scenario["status"], "small"),
                    p("Wejście: " + scenario["input"]),
                    p("Oczekiwane zachowanie: " + scenario["expectedBehavior"]),
                    p("Przebieg w fikcyjnym przykładzie: " + scenario["demoBehavior"]),
                ]
            )
        )
    story.append(PageBreak())

    add("Proces i zakres przykładu", "h1")
    process = data["currentProcess"]
    for key, title in (
        ("roles", "Role"),
        ("manualSteps", "Ręczne kroki"),
        ("dataSources", "Źródła danych"),
        ("timeLosses", "Miejsca utraty czasu"),
        ("assumptions", "Założenia wejściowe"),
    ):
        section(title, process[key])
    section(data["scope"]["includedTitle"], data["scope"]["included"])
    section(data["scope"]["excludedTitle"], data["scope"]["excluded"])
    story.append(PageBreak())

    add(data["riskRegisterTitle"], "h1")
    for risk in data["riskRegister"]:
        story.append(
            KeepTogether(
                [
                    p(risk["name"], "h2"),
                    p(risk["meaning"], "small"),
                    p("Ograniczenie: " + risk["mitigation"], "small"),
                    p("Weryfikacja: " + risk["verificationMoment"], "small"),
                ]
            )
        )
    section(data["acceptanceCriteriaTitle"], data["acceptanceCriteria"])
    section(data["firstStageTitle"], data["firstStagePlan"])
    add(
        "Zakres konkretnego etapu ustalamy osobno. Ten dokument przedstawia fikcyjny przykład.",
        "small",
    )

    def decorate(canvas, document):
        canvas.saveState()
        canvas.setFillColor(MUTED)
        canvas.setFont("Report", 8)
        canvas.drawString(
            42, 24, "Protolume | Fikcyjny przykład - nie case study klienta"
        )
        canvas.drawRightString(A4[0] - 42, 24, str(document.page))
        canvas.restoreState()

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=42,
        leftMargin=42,
        topMargin=37,
        bottomMargin=42,
        title=data["title"],
        author="Protolume",
        subject=data["fictionalNotice"],
        pageCompression=1,
        invariant=1,
    )
    doc.build(story, onFirstPage=decorate, onLaterPages=decorate)
    pdf = OUTPUT.read_bytes()
    (ASSETS / OUTPUT.name).write_bytes(pdf)
    manifest = {
        "version": data["version"],
        "preparedOn": data["preparedOn"],
        "contentSha256": hashlib.sha256(raw).hexdigest(),
        "rendererSha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "fonts": {
            name: hashlib.sha256((fonts / name).read_bytes()).hexdigest()
            for name in ("DejaVuSans.ttf", "DejaVuSans-Bold.ttf")
        },
        "pdfSha256": hashlib.sha256(pdf).hexdigest(),
        "generator": "ReportLab " + reportlab.Version,
        "pdf": OUTPUT.name,
    }
    (ASSETS / "demo-report-manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Generated {OUTPUT.name}: {len(pdf)} bytes, version {data['version']}")


if __name__ == "__main__":
    main()
