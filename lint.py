#!/usr/bin/env python3
import subprocess

# Invoke Google Closure linter (requires Python2)
subprocess.call([
  'gjslint',
  '--recurse', '.',
  '--jslint_error', 'all'])

# See http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
