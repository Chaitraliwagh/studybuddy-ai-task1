// Demo notes for trying the app quickly (written for this project).
export const SAMPLE_NOTES = `Operating systems manage computer hardware and software resources. An operating system (OS) sits between the user's programs and the physical hardware. Its main jobs are process management, memory management, file management, and device management.

A process is a program that is currently running. The CPU scheduler decides which process uses the CPU and for how long. Common scheduling algorithms include First Come First Served (FCFS), Shortest Job First (SJF), and Round Robin. In Round Robin, every process gets a small fixed slice of CPU time called a time quantum, and then the next process gets a turn.

Memory management keeps track of which parts of memory are in use. Virtual memory lets a computer run programs larger than its physical RAM by moving unused data to the disk. Paging divides memory into fixed-size blocks called pages. A page fault happens when a program needs a page that is not currently in RAM, so the OS must load it from disk.

A deadlock happens when two or more processes wait for each other forever because each one holds a resource the other needs. The four conditions for deadlock are mutual exclusion, hold and wait, no preemption, and circular wait. If any one of these conditions is prevented, deadlock cannot occur.

The file system organizes how data is stored and retrieved on a disk. It uses files and directories, and it keeps metadata such as file size, owner, and permissions.`;
