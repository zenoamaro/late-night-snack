/**
 * A virtual stack machine
 * =======================
 * 17 February 2018 — https://latenightsnack.io
 *
 * A [virtual machine] is a simulated computer. Computers are highly
 * predictable machines, whose behavior only depend on their program,
 * inputs, and previous [state]. If we have knowledge of all those
 * elements, we can reproduce the machine in software entirely.
 *
 * Specifically, this is a [stack machine], which gets its name from
 * the [stack] it uses as its main data structure. A stack is a pile
 * of values, where entries get placed and taken from the top. Most
 * operations *pop* one or two operands from the top of the stack, and
 * *push* back the results.
 *
 * This is not an emulator of a real machine, but an *ideal* machine,
 * with infinite memory and few limitations on data size, where all
 * instructions execute in one cycle, and there is no need to respect
 * tight timings or synchronize with other devices. This is only
 * possible because it runs on a high-level run-time (the javascript
 * engine) which abstract all of these problems away from us.
 *
 * I designed this machine to be nimble, readable, yet expressive and
 * fun to play with.
 * 
 * [Get the code] or [try it out]!
 * 
 * [virtual machine]: https://en.wikipedia.org/wiki/Virtual_machine
 * [state]: https://en.wikipedia.org/wiki/State_(computer_science)
 * [stack machine]: https://en.wikipedia.org/wiki/Stack_machine
 * [stack]: https://en.wikipedia.org/wiki/Stack_(abstract_data_type)
 * [registers]: https://en.wikipedia.org/wiki/Processor_register
 * [Get the code]: https://github.com/zenoamaro/late-night-snack/blob/master/2018-02-17%20A%20virtual%20stack%20machine.js
 * [try it out]: https://jsbin.com/bacokob/edit?js,console
 */


/**
 * Let's start with a program
 * --------------------------
 * This is a short program that computes ten iterations of the
 * [fibonacci sequence].
 *
 * A program is a contiguous sequence of numbers, called [opcodes],
 * each one representing a different [instruction], optionally
 * followed by their data. Together, they are referred to as the
 * [machine code]. Execution starts from the first instruction, and
 * continues until the end of the program is reached.
 *
 * Our program memory is represented as [read-only memory], a type of
 * memory that cannot be written back. It is the only external input
 * our machines has. Program memory is separate from [application
 * memory], a configuration known as [Harvard architecture], and
 * machine code cannot access it. Among other things, this means that
 * a program cannot [modify itself], or provide additional code for
 * execution.
 *
 * The most astute among you might notice that this program could be
 * much shorter, while retaining the same functionality. Try and see
 * how much you can [optimize] it.
 *
 * [fibonacci sequence]: https://en.wikipedia.org/wiki/Fibonacci_sequence
 * [opcodes]: https://en.wikipedia.org/wiki/Opcode
 * [instruction]: https://en.wikipedia.org/wiki/Instruction_set_architecture
 * [operand]: https://en.wikipedia.org/wiki/Operand#Computer_science
 * [machine code]: https://en.wikipedia.org/wiki/Machine_code
 * [read-only memory]: https://en.wikipedia.org/wiki/Read-only_memory
 * [application memory]: https://en.wikipedia.org/wiki/Random-access_memory
 * [Harvard architecture]: https://en.wikipedia.org/wiki/Harvard_architecture
 * [modify itself]: https://en.wikipedia.org/wiki/Self-modifying_code
 * [optimize]: https://en.wikipedia.org/wiki/Program_optimization
 */

function main() {
  compute([
    // Initialize operands and counter, store into memory
    0x01, 10, 0x01, 0, 0x07,            // PUSH 10; PUSH 0; STORE
    0x01,  1, 0x01, 1, 0x07,            // PUSH  1; PUSH 1; STORE
    0x01,  1, 0x01, 2, 0x07,            // PUSH  1; PUSH 2; STORE

    // Load operands from memory into the stack
    0x01, 1, 0x06,                      // PUSH 1; LOAD
    0x01, 2, 0x06,                      // PUSH 2; LOAD
    // Keep a copy of the first operand and sum them
    0x04,                               // OVER
    0x10,                               // ADD
    // Printing consumes the value, so we duplicate it
    0x03, 0x0F,                         // DUP; OUT
    // Store result and previous operand into memory
    0x01, 1, 0x07,                      // PUSH 1; STORE
    0x01, 2, 0x07,                      // PUSH 2; STORE

    // Load counter into the stack, decrement and store back
    0x01, 0, 0x06,                      // PUSH 0; LOAD
    0x01, 1, 0x11,                      // SUB 1
    0x03, 0x01, 0, 0x07,                // DUP; PUSH 0; STORE
    // Unless counter is zero, jump back to start of loop
    0x01, -29, 0x0A,                    // PUSH -29; JNZ
  ]);
}


/**
 * The virtual machine
 * ===================
 * Let's design our [virtual machine]:
 *
 * _It shall be simple, straight-forward, and not too adorned. It
 * shall be possible to understand all of it in a single reading.
 * Everything we put in, has to be there for a reason._
 *
 * _It shall be powerful enough to express many classic [algorithms]
 * and other interesting data processing problems, but not so powerful
 * that it becomes complicated to understand._
 *
 * _It shall be completely [deterministic]. Given the same state, it
 * shall produce the same results. Nothing shall be hidden or
 * implicit. Everything it does shall happen under the sun._
 *
 * _Most importantly, it shall be easy and [fun] to program for._
 *
 * Alright, let's get to it.
 *
 * [virtual machine]: https://en.wikipedia.org/wiki/Virtual_machine
 * [algorithms]: https://en.wikipedia.org/wiki/Algorithm
 * [deterministic]: https://en.wikipedia.org/wiki/Determinism
 * [fun]: https://en.wikipedia.org/wiki/Fun
 */


/**
 * This data structure can represent the full [state] of the machine
 * at any point in time. Given the same program and the same state,
 * the machine will always produce the same results.
 *
 * The basic data type is the [floating point] number. The contents of
 * the [program memory] are provided externally, and a [program
 * counter] points to the location of the next instruction to execute.
 * A [boolean flag] tracks whether the machine is halted. Neither
 * [application memory] or [stack] are limited in size.
 *
 * [state]: https://en.wikipedia.org/wiki/State_(computer_science)
 * [floating point]: https://en.wikipedia.org/wiki/Floating-point_arithmetic
 * [program memory]: https://en.wikipedia.org/wiki/Read-only_memory
 * [program counter]: https://en.wikipedia.org/wiki/Program_counter
 * [boolean flag]: https://en.wikipedia.org/wiki/Bit_field
 * [application memory]: https://en.wikipedia.org/wiki/Random-access_memory
 * [stack]: https://en.wikipedia.org/wiki/Stack_(abstract_data_type)
 */
function create(rom) {
  return {
    rom,                                // Program memory
    pc: 0,                              // Program counter
    ram: [],                            // Application memory
    stack: [],                          // Data stack
    halted: false,                      // Execution interrupted
  };
}

/**
 * The [fetch-decode-execute cycle] is the basic operational step of
 * the machine. [Opcodes] are fetched from [program memory], and
 * decoded into [instructions], which are then [executed] internally,
 * bringing the machine to a new state with the results of the
 * operation.
 *
 * [fetch-decode-execute cycle]: https://en.wikipedia.org/wiki/Instruction_cycle
 * [Opcodes]: https://en.wikipedia.org/wiki/Opcode
 * [program memory]: https://en.wikipedia.org/wiki/Read-only_memory
 * [instructions]: https://en.wikipedia.org/wiki/Instruction_set_architecture
 * [executed]: https://en.wikipedia.org/wiki/Execution_(computing)
 */
function cycle(state) {
  if (state.halted) return;
  const opcode = fetch(state);          // Fetch
  const instruction = decode(opcode);   // Decode
  instruction(state);                   // Execute
  if (state.pc >= state.rom.length) state.halted = true;
}

/**
 * Fetching an [opcode] involves reading a value from [program
 * memory], at the location pointed to by the [program counter], which
 * gets immediately incremented to be ready for the next fetch.
 *
 * [opcode]: https://en.wikipedia.org/wiki/Opcode
 * [program memory]: https://en.wikipedia.org/wiki/Read-only_memory
 * [program counter]: https://en.wikipedia.org/wiki/Program_counter
 */
function fetch(state) {
  const value = state.rom[state.pc++];  // Increment PC after read
  if (typeof value !== 'number') throw `Illegal value, '${value}'`;
  return value;
}

/**
 * An [opcode] is an instruction codified into a value. A [translation
 * table] defines which instruction the opcode should map to. Most
 * real machines employ a similar system, using a small memory to map
 * opcodes to the appropriate circuitry.
 *
 * [opcode]: https://en.wikipedia.org/wiki/Opcode
 * [translation table]: #the-instructions
 */
function decode(opcode) {
  const instruction = instructions[opcode];
  if (!instruction) throw `Illegal opcode, '${opcode}'`;
  return instruction;
}

/**
 * To simulate a complete run, we start from a clean state, like in a
 * freshly-started machine, and we keep cycling from state to state
 * until the machine halts.
 */
function compute(rom) {
  const state = create(rom);
  while (!state.halted) cycle(state);
}


/**
 * Microinstructions
 * =================
 * To operate the machine, we define a set of [primitives] that will
 * be composed together to form the actual instructions. These
 * primitives, called [microinstructions], control specific subsystems
 * of the machine, and stand at a lower level than even machine code.
 *
 * Their [orthogonality] is an important feature: they don't overlap
 * in function, while covering still the entire feature set: this is
 * what allows them to be composed in arbitrary fashions, to create
 * many kinds of concrete instructions.
 *
 * Just by looking at them, you can get a good idea of what the core
 * capabilities of a machine are.
 *
 * [primitives]: https://en.wikipedia.org/wiki/Language_primitive#Microcode_primitives
 * [microinstructions]: https://en.wikipedia.org/wiki/Microcode
 * [orthogonality]: https://en.wikipedia.org/wiki/Orthogonality#Computer_science
 */

/**
 * The stack
 * ---------
 * The [stack] is a collection of elements that is operated by placing
 * or taking values from its tail. Most instructions consume one or
 * more operands from the stack, and push back the results.
 *
 * This machine has just one stack, which is not part of application
 * memory. There are no limits to its length, so we can push as many
 * items as we want. Popping from an empty stack is very often a bug,
 * so, conveniently, trying to do that produces an error.
 *
 * [stack]: https://en.wikipedia.org/wiki/Stack_(abstract_data_type)
 */

function push(state, value) {
  state.stack.push(value);
}

function pop(state) {
  if (state.stack.length < 1) throw 'Popping from empty stack';
  return state.stack.pop();
}

/**
 * Application memory
 * ------------------
 * [Application memory] is an array of cells, each one identified by a
 * sequential [address] number and capable of holding one value. This
 * type of memory can be read from and written to at any point in time
 * and at arbitrary locations.
 *
 * There are no size limits, so there is a potentially infinite amount
 * of locations. However, it's not allowed to address locations behind
 * address zero.
 *
 * [Application memory]: https://en.wikipedia.org/wiki/Random-access_memory
 * [address]: https://en.wikipedia.org/wiki/Memory_address
 */

function load(state, address) {
  if (address < 0) throw `Reading from illegal address, '${address}'`;
  return state.ram[address] || 0;
}

function store(state, address, value) {
  if (address < 0) throw `Writing to illegal address, '${address}'`;
  state.ram[address] = value;
}

/**
 * Control flow
 * ------------
 * By manipulating the value of the [program counter], execution can
 * be moved to any point in the code, an operation called [jump],
 * giving the ability to execute code multiple times in a [loop].
 *
 * When we pair the jump with a condition that must be true, the jump
 * operation becomes a conditional branch, referring to execution
 * branching in two different paths.
 *
 * All the conditional branching operations can be generalized to a
 * form such as `PREDICATE ? JUMP : SKIP`.
 *
 * [program counter]: https://en.wikipedia.org/wiki/Program_counter
 * [jump]: https://en.wikipedia.org/wiki/Branch_(computer_science)
 * [loop]: https://en.wikipedia.org/wiki/Control_flow#Loops
 */

function jump(state, address) {
  if (address < 0) throw `Jumping before start of ROM`;
  if (address >= state.rom.length) throw `Jumping after end of ROM`;
  state.pc = address;
}

function branch(state, predicate) {
  const offset = pop(state);
  // Pop as many values as the parameters of the predicate function
  const values = Array(predicate.length).fill(state).map(pop);
  // Reverse order of values for a more natural usage
  const satisfied = predicate(...values.reverse());
  // Jump by an offset if the predicate is satisfied
  if (satisfied) jump(state, state.pc + offset);
}

/**
 * Operations
 * ----------
 * All of the value operations, whether they are arithmetic, bitwise,
 * or simple stack mutations, operate in a similar way: they pop one
 * or more operands from the stack, combine or shuffle them to get a
 * new value, and push back the result. Therefore, we can generalize
 * them to a form such as `A, B → B, A`.
 */

function operate(state, operation) {
  // Pop as many values as the parameters of the operation function
  const values = Array(operation.length).fill(state).map(pop);
  // Reverse order of values for a more natural usage
  const results = operation(...values.reverse());
  // Push back each result in the same order
  results.map(result => push(state, result));
}


/**
 * The instruction set
 * ===================
 * A machine is commonly defined by its [instruction set]. The amount,
 * flexibility, and expressiveness of the instructions provided by the
 * machine will make a developer remember it fondly, or hate it with
 * their guts.
 *
 * The [x86] instruction set powering most desktop PCs, the [ARM] set
 * found in mobile phones, and the [6502] set of 8-bit consoles are
 * famous examples of [instruction set architectures] that are in use
 * today.
 *
 * Can there be an architecture other than instruction set? Of course!
 * For example, the [zero-instruction set computer] can be said to
 * have no instructions at all.
 *
 * [instruction set]: https://en.wikipedia.org/wiki/Instruction_set_architecture
 * [instruction set architectures]: https://en.wikipedia.org/wiki/Instruction_set_architecture
 * [x86]: https://en.wikipedia.org/wiki/x86
 * [ARM]: https://en.wikipedia.org/wiki/ARM_architecture
 * [6502]: https://en.wikipedia.org/wiki/MOS_Technology_6502
 * [zero-instruction set computer]: https://en.wikipedia.org/wiki/Zero_instruction_set_computer
 */

/**
 * The translation table
 * ---------------------
 * This table maps each opcode to the instruction it references to. It
 * is so that opcode `0x00` is mapped to the `NOP` instruction, `0x07`
 * to `STORE`, `0x08` to `JMP`, and so on. Decoding an instruction is
 * then just a matter of addressing this table with the value of the
 * opcode.
 *
 * Each instruction is actually implemented as a [microprogram], made
 * up of [microinstructions] to be executed in sequence.
 *
 * [microprogram]: https://en.wikipedia.org/wiki/Microprogram
 * [microinstructions]: https://en.wikipedia.org/wiki/Microcode
 */
const instructions = [
  /* 0x00 */  NOP,   PUSH,  DROP,  DUP,   OVER,  SWAP,  LOAD,  STORE,
  /* 0x08 */  JMP,   JZ,    JNZ,   JE,    JG,    JL,    HALT,  OUT,
  /* 0x10 */  ADD,   SUB,   MUL,   DIV,   MOD,   NOT,   AND,   OR,
  /* 0x18 */
];

/**
 * Stack manipulation instructions
 * -------------------------------
 * The main way to get data into the [stack] is by pushing a [literal]
 * value, found in program code, on its top. In this machine, this is
 * the only type of data that comes from the external world.
 *
 * Because operations consume the values they pop from the stack,
 * there are ways to duplicate values needed for future operations.
 * Operations might also need operands to be in a different order, and
 * while there is no way to access arbitrary positions on the stack,
 * it is still possible to limitedly reach over the top-most value.
 *
 * [stack]: https://en.wikipedia.org/wiki/Stack_(abstract_data_type)
 * [literal]: https://en.wikipedia.org/wiki/Literal_(computer_programming)
 */

function PUSH(state) {
  const value = fetch(state);
  push(state, value);
}

function DROP(state) { return operate(state, (   a) => [       ]) }
function DUP (state) { return operate(state, (   a) => [a, a   ]) }
function SWAP(state) { return operate(state, (a, b) => [b, a   ]) }
function OVER(state) { return operate(state, (a, b) => [a, b, a]) }


/**
 * Memory access instructions
 * --------------------------
 * [Random-access memory] allows reading and writing from and to
 * arbitrary locations of memory. The [address] of the location is
 * always taken from the [stack]. When reading from a location, a
 * value is placed on top of the stack, otherwise, another value will
 * be popped from the stack, to be written to memory.
 *
 * These are the [only instructions] dealing with application memory,
 * while every other operation only operates on the stack. As such, it
 * is less complicated, compared to machines where each instruction
 * needs variants for each type of memory access, such as [CISC].
 *
 * [Random-access memory]: https://en.wikipedia.org/wiki/Random-access_memory
 * [address]: https://en.wikipedia.org/wiki/Memory_address
 * [stack]: https://en.wikipedia.org/wiki/Stack_(abstract_data_type)
 * [only instructions]: https://en.wikipedia.org/wiki/Orthogonality#Computer_science
 * [CISC]: https://en.wikipedia.org/wiki/Complex_instruction_set_computer
 */

function LOAD(state) {
  const address = pop(state);
  const value = load(state, address);
  push(state, value);
}

function STORE(state) {
  const address = pop(state);
  const value = pop(state);
  store(state, address, value);
}

/**
 * Control flow instructions
 * -------------------------
 * One of the defining characteristics of an all-purpose computer is
 * the ability to execute the same code multiple times, or to redirect
 * execution conditionally, so that it becomes possible to write
 * generic code, capable of reacting to a variety of complex cases.
 *
 * Apart from unconditional jumps, which always move execution, all
 * other jumps pop one or two values from the stack, and compare them
 * together or to a known value. Given how common an operation it is,
 * there are shortcuts to check for zero or non-zero values.
 *
 * One seemingly-useless operation, `NOP`, does exactly nothing. It is
 * conveniently mapped as opcode `0x00` as a way to pad programs with
 * empty, non-executable code; it is also an easy way to delete short
 * sequences of instructions without shifting part of the program, all
 * of which are useful techniques when creating machine code by hand.
 *
 * Additionally, the machine can be halted, and execution will stop.
 */

function JMP(state) { return branch(state, (    ) => true   ) }

function  JZ(state) { return branch(state, (   a) => a === 0) }
function JNZ(state) { return branch(state, (   a) => a !== 0) }

function  JE(state) { return branch(state, (a, b) => a === b) }
function  JG(state) { return branch(state, (a, b) => a > b  ) }
function  JL(state) { return branch(state, (a, b) => a < b  ) }

function NOP() {
  // Does nothing
}

function HALT(state) {
  state.halted = true;
}


/**
 * Arithmetic and bit-wise operations
 * ----------------------------------
 * The basic value of the machine is the [floating point] number, so
 * a basic set of arithmetic operations to work on them is provided.
 *
 * Bit-wise instructions operate on the actual bits of the binary
 * representation of a value, and are often used to invert conditions,
 * determine the presence of specific bits, the evenness or the sign
 * of a number, to merge sequences of bits together, and so on.
 *
 * [floating point]: https://en.wikipedia.org/wiki/Floating-point_arithmetic
 */

function ADD(state) { return operate(state, (a, b) => [a + b]) }
function SUB(state) { return operate(state, (a, b) => [a - b]) }
function MUL(state) { return operate(state, (a, b) => [a * b]) }
function DIV(state) { return operate(state, (a, b) => [a / b]) }
function MOD(state) { return operate(state, (a, b) => [a % b]) }

function NOT(state) { return operate(state, (   a) => [~a   ]) }
function AND(state) { return operate(state, (a, b) => [a & b]) }
function  OR(state) { return operate(state, (a, b) => [a | b]) }

/**
 * Output instructions
 * -------------------
 * The only way this machine has to communicate with the external
 * world, is by outputting values to the screen. It is not strictly
 * necessary, in order to perform a calculation, but we also want some
 * gratification after all.
 */

function OUT(state) {
  const value = pop(state);
  console.log(value);
}


/**
 * Finally, we start the whole thing.
 */
main();


/**
 * Where to go from here
 * =====================
 * I only included these 24 instructions, to keep the overall design
 * simple, yet useful, and not too distracting from the core concept
 * of a programmable machine. However, you can invent new instructions
 * to do all sort of useful and interesting things, like squaring
 * numbers, generating [random values], breaking into a [debugger], or
 * accessing virtual [peripherals].
 *
 * Speaking of which, you might have noticed that this machine has no
 * way to communicate with the external world. If you ask, I am sure
 * that it is dying to [interact with humans] or [other machines]. Why
 * not provide a few instructions to read [input] from the [keyboard],
 * or a [game controller]?
 *
 * [human interaction]: https://en.wikipedia.org/wiki/Human–computer_interaction
 *
 * You might want to support text as well. But how do you represent
 * text, when you only have numbers at your disposal? You use a [text
 * encoding], for example, the famous [ASCII encoding], which maps
 * numbers from `0` to `127` to characters from the latin alphabet,
 * and vice-versa.
 *
 * At this point, why not add full [video] and [audio] capabilities?
 * Some machines provide special instructions to operate their
 * hardware, such as `LINE`, `COLOR`, `SOUND`, and our own `OUT`
 * instruction. Other machines allow their programmers to directly
 * control what appears on the screen by writing to [video memory],
 * which is [memory-mapped] to a specific memory region, so that
 * writing a `97` at location `42` might make an `a` character appear
 * at row `3`, column `2`, turn on a red pixel, or maybe play a
 * musical note.
 *
 * You could [embed] this [virtual machine] as part of some other
 * program, why not? For example, you could use it to [control] a [3d
 * printer], or an [IOT sensor]. You could even use one to script your
 * game, just like the legendary [ScummVM] did.
 *
 * Finally, you can turn towards emulating real machines. The [IBM
 * Model 25] mainframe played a very nice trick: it could load its
 * microcode from [punched card], therefore being able to emulate
 * other machines, and becoming compatible with code written for them.
 * Or you could go deeper, and add details from physical machines:
 * limited memory capacity, fixed-sized data types, complex timings,
 * interrupts, and so on.
 *
 * Have a good night.
 *
 * [random values]: https://en.wikipedia.org/wiki/Random_number_generation
 * [debugger]: https://en.wikipedia.org/wiki/Debugger
 * [peripherals]: https://en.wikipedia.org/wiki/Peripheral
 * [interact with humans]: https://en.wikipedia.org/wiki/Human–computer_interaction
 * [other machines]: https://en.wikipedia.org/wiki/Machine_to_machine
 * [input]: https://en.wikipedia.org/wiki/Input_(computer_science)
 * [keyboard]: https://en.wikipedia.org/wiki/Computer_keyboard
 * [game controller]: https://en.wikipedia.org/wiki/Game_controller
 * [text encoding]: https://en.wikipedia.org/wiki/Character_encoding
 * [ASCII encoding]: https://en.wikipedia.org/wiki/ASCII
 * [video]: https://en.wikipedia.org/wiki/Display_device
 * [audio]: https://en.wikipedia.org/wiki/Digital_audio
 * [memory-mapped]: https://en.wikipedia.org/wiki/Memory-mapped_I/O
 * [video memory]: https://en.wikipedia.org/wiki/Video_display_controller
 * [embed]: https://en.wikipedia.org/wiki/Embedded_system
 * [virtual machine]: https://en.wikipedia.org/wiki/Virtual_machine
 * [control]: https://en.wikipedia.org/wiki/Controller_(computing)
 * [3d printer]: https://en.wikipedia.org/wiki/3D_printing
 * [IOT sensor]: https://en.wikipedia.org/wiki/Internet_of_things
 * [ScummVM]: https://en.wikipedia.org/wiki/ScummVM
 * [IBM Model 25]: https://en.wikipedia.org/wiki/IBM_System/360_Model_25
 * [punched card]: https://en.wikipedia.org/wiki/Punched_card
 */