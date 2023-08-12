# nasmc |||||||||||||||||||

Compile x86 online quickly. Uses `nasm -felf32 -Werror` and `objdump -M intel -d` on the server.

- [src/assets/lnasm](./src/assets/lnasm)
- [src/assets/objdump](./src/assets/objdump)

Have been both statically linked with libc, and compiled for vercel's serverless environment.
