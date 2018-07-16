#!/bin/sh

reflex -sr '\.go$' -R '^ui/' -- sh -c 'make && ./build/sharebox -dir ~/'
