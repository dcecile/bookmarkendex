#!/usr/bin/env python3
import subprocess

# Invoke Inkscape for each size
for size in [ 16, 24, 28, 32, 48, 64, 112, 224 ]:
  subprocess.call([
    'inkscape',
    '--file', 'icon.svg',
    '--export-png', 'icon_%(size)d.png' % { 'size': size },
    '--export-width', '%(size)d' % { 'size': size },
    '--export-height', '%(size)d' % { 'size': size }])

# Invoke Inkscape for each size
for (originalSize, paddedSize) in [ ( 112, 128 ), ( 224, 256 ) ]:
  subprocess.call([
    'convert',
    'icon_%(size)d.png' % { 'size': originalSize },
    '-background', 'transparent',
    '-gravity', 'center',
    '-extent', '%(size)dx%(size)d' % { 'size': paddedSize },
    'icon_%(size)d_padded.png' % { 'size': paddedSize }])
