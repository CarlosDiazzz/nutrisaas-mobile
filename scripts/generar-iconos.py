#!/usr/bin/env python3
"""Genera el ícono, el ícono adaptable de Android y la imagen de la pantalla de inicio de NutriSaaS (una hoja).
Uso: python3 scripts/generar-iconos.py   (requiere Pillow; los colores son los de src/theme/tokens.ts)"""
from pathlib import Path
from PIL import Image, ImageDraw

VERDE = (46, 125, 91, 255)        # colores.primario
VERDE_OSCURO = (39, 107, 77, 255)  # colores.primarioOscuro
BLANCO = (255, 255, 255, 255)
SALIDA = Path(__file__).resolve().parent.parent / 'assets' / 'images'
SS = 4  # supersampling para bordes suaves


def hoja(lado, ocupa, color, nervadura):
    """Hoja (lente inclinada a 45°) con nervadura, centrada en un lienzo transparente lado×lado."""
    g = lado * SS
    tam = int(g * ocupa)
    lienzo = Image.new('RGBA', (tam, tam), (0, 0, 0, 0))
    # Lente = intersección de dos círculos grandes
    r = tam * 0.78
    c1 = Image.new('L', (tam, tam), 0); c2 = Image.new('L', (tam, tam), 0)
    ImageDraw.Draw(c1).ellipse([tam / 2 - r + tam * 0.34, tam / 2 - r - tam * 0.34 + 0, tam / 2 + r + tam * 0.34, tam / 2 + r - tam * 0.34 + 0], fill=255)
    ImageDraw.Draw(c2).ellipse([tam / 2 - r - tam * 0.34, tam / 2 - r + tam * 0.34, tam / 2 + r - tam * 0.34, tam / 2 + r + tam * 0.34], fill=255)
    mascara = Image.new('L', (tam, tam), 0)
    mascara.paste(c1, (0, 0), c2)
    lienzo.paste(Image.new('RGBA', (tam, tam), color), (0, 0), mascara)
    if nervadura:
        d = ImageDraw.Draw(lienzo)
        ancho = max(2, tam // 40)
        d.line([(tam * 0.22, tam * 0.78), (tam * 0.74, tam * 0.26)], fill=nervadura, width=ancho)
        d.line([(tam * 0.44, tam * 0.56), (tam * 0.44, tam * 0.36)], fill=nervadura, width=max(2, ancho // 2))
        d.line([(tam * 0.44, tam * 0.56), (tam * 0.64, tam * 0.56)], fill=nervadura, width=max(2, ancho // 2))
    salida = Image.new('RGBA', (g, g), (0, 0, 0, 0))
    salida.paste(lienzo, ((g - tam) // 2, (g - tam) // 2), lienzo)
    return salida.resize((lado, lado), Image.LANCZOS)


def sobre_fondo(lado, fondo, figura):
    base = Image.new('RGBA', (lado, lado), fondo)
    base.alpha_composite(figura)
    return base


# Ícono (iOS y tiendas): fondo verde, hoja blanca.
sobre_fondo(1024, VERDE, hoja(1024, 0.62, BLANCO, VERDE)).convert('RGB').save(SALIDA / 'icon.png')
# Android adaptable: la zona segura es el 66 % central; fondo liso, hoja en primer plano y versión monocroma.
Image.new('RGBA', (512, 512), VERDE).save(SALIDA / 'android-icon-background.png')
hoja(512, 0.50, BLANCO, VERDE).save(SALIDA / 'android-icon-foreground.png')
hoja(432, 0.50, (0, 0, 0, 255), (0, 0, 0, 0)).save(SALIDA / 'android-icon-monochrome.png')
# Pantalla de inicio: hoja blanca sobre el verde de app.json.
hoja(512, 0.9, BLANCO, VERDE).save(SALIDA / 'splash-icon.png')
sobre_fondo(48, VERDE, hoja(48, 0.7, BLANCO, VERDE)).convert('RGB').save(SALIDA / 'favicon.png')
print('Íconos generados en', SALIDA)
