#!/usr/bin/env python3
import subprocess

# Invoke Inkscape for each size
for size in [ 16, 24, 28, 32, 48, 64, 128, 256 ]:
  subprocess.call([
    'inkscape',
    '--file',
    'icon.svg',
    '--export-png',
    'icon_%(size)d.png' % { 'size': size },
    '--export-width',
    '%(size)d' % { 'size': size },
    '--export-height',
    '%(size)d' % { 'size': size }])
