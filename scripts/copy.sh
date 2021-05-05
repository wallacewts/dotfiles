#!/bin/bash

# Up from scripts dir
cd ..

cp -r .config ${HOME}
cp -r .fonts ${HOME}
ln -s "$(pwd)/.gitconfig" ~/.zshrc
ln -s "$(pwd)/.zshrc" ~/.zshrc
ln -s "$(pwd)/.bashrc" ~/.zshrc