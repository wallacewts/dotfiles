#!/bin/bash

echo "💎️ Installing asdf"
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.8.0
asdf plugin-add nodejs