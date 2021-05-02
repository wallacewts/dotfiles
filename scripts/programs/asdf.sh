#!/bin/bash

figlet Installing asdf | lolcat
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.8.0

# Install nodejs with asdf
figlet Installing NodeJS | lolcat
~/.asdf/bin/asdf plugin add nodejs
~/.asdf/bin/asdf install nodejs latest:lts
~/.asdf/bin/asdf global nodejs lts