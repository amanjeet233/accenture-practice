more_balanced = [
    # --- CYBERSECURITY ---
    {
        "section": "Cybersecurity",
        "topic": "Access Control",
        "subtopic": "Role-Based Access Control",
        "question": "Which access control model restricts system access based on user job roles and privileges within an organization?",
        "options": [
            {"id": "A", "text": "Discretionary Access Control (DAC)"},
            {"id": "B", "text": "Mandatory Access Control (MAC)"},
            {"id": "C", "text": "Attribute-Based Access Control (ABAC)"},
            {"id": "D", "text": "Role-Based Access Control (RBAC)"}
        ],
        "correctOptionId": "D",
        "explanation": "RBAC assigns permissions to specific organizational roles rather than individual accounts, simplifying enterprise administration.",
        "difficulty": "EASY"
    },
    {
        "section": "Cybersecurity",
        "topic": "Public Key Infrastructure",
        "subtopic": "Digital Certificates",
        "question": "Which trusted authority digitally signs X.509 SSL/TLS certificates to validate identity on the web?",
        "options": [
            {"id": "A", "text": "Internet Assigned Numbers Authority (IANA)"},
            {"id": "B", "text": "Domain Name Registrar"},
            {"id": "C", "text": "Certificate Authority (CA)"},
            {"id": "D", "text": "Regional Internet Registry (RIR)"}
        ],
        "correctOptionId": "C",
        "explanation": "A Certificate Authority (CA) verifies applicant identities and digitally signs certificates to guarantee trust in public key infrastructure.",
        "difficulty": "EASY"
    },

    # --- CLOUD COMPUTING ---
    {
        "section": "Cloud",
        "topic": "Disaster Recovery",
        "subtopic": "RTO vs RPO",
        "question": "What metric defines the maximum acceptable duration of data loss measured in time backward from a catastrophic outage?",
        "options": [
            {"id": "A", "text": "Recovery Time Objective (RTO)"},
            {"id": "B", "text": "Mean Time Between Failures (MTBF)"},
            {"id": "C", "text": "Service Level Objective (SLO)"},
            {"id": "D", "text": "Recovery Point Objective (RPO)"}
        ],
        "correctOptionId": "D",
        "explanation": "RPO (Recovery Point Objective) represents acceptable data loss measured back in time (e.g. 15 minutes of transactional data).",
        "difficulty": "MEDIUM"
    },
    {
        "section": "Cloud",
        "topic": "Managed Databases",
        "subtopic": "NoSQL Models",
        "question": "Which cloud-native database category stores data as flexible, semi-structured JSON-like documents (e.g. MongoDB, AWS DynamoDB)?",
        "options": [
            {"id": "A", "text": "Relational OLAP Database"},
            {"id": "B", "text": "Columnar Data Warehouse"},
            {"id": "C", "text": "Document / Key-Value NoSQL Store"},
            {"id": "D", "text": "Graph Property Store"}
        ],
        "correctOptionId": "C",
        "explanation": "Document-based NoSQL engines store self-describing JSON/BSON structures allowing dynamic, schemaless scaling.",
        "difficulty": "EASY"
    },

    # --- NETWORKING ---
    {
        "section": "Networking",
        "topic": "Network Troubleshooting",
        "subtopic": "Traceroute",
        "question": "Which IP header field is systematically incremented from 1 upwards by the traceroute utility to discover intermediate routers?",
        "options": [
            {"id": "A", "text": "Protocol identifier"},
            {"id": "B", "text": "Checksum"},
            {"id": "C", "text": "Identification"},
            {"id": "D", "text": "Time to Live (TTL)"}
        ],
        "correctOptionId": "D",
        "explanation": "Traceroute sends packets with increasing TTL values (1, 2, 3...); each router decrements TTL, expiring it and sending ICMP Time Exceeded.",
        "difficulty": "MEDIUM"
    },
    {
        "section": "Networking",
        "topic": "Wireless Networking",
        "subtopic": "WPA3 Security",
        "question": "Which cryptographic handshake replaces the vulnerable 4-way Pre-Shared Key handshake in WPA3 Wi-Fi security?",
        "options": [
            {"id": "A", "text": "WEP 128-bit RC4"},
            {"id": "B", "text": "WPA Enterprise TKIP"},
            {"id": "C", "text": "Simultaneous Authentication of Equals (SAE)"},
            {"id": "D", "text": "MD5 Challenge-Response"}
        ],
        "correctOptionId": "C",
        "explanation": "WPA3 uses SAE (Simultaneous Authentication of Equals / Dragonfly handshake) to prevent offline dictionary and eavesdropping attacks.",
        "difficulty": "MEDIUM"
    },

    # --- MS OFFICE ---
    {
        "section": "MS Office",
        "topic": "Excel",
        "subtopic": "Logical Functions",
        "question": "Which Excel function evaluates multiple conditions and returns a value corresponding to the first TRUE condition?",
        "options": [
            {"id": "A", "text": "IFERROR"},
            {"id": "B", "text": "CHOOSE"},
            {"id": "C", "text": "AND"},
            {"id": "D", "text": "IFS"}
        ],
        "correctOptionId": "D",
        "explanation": "IFS(logical_test1, value_if_true1, [logical_test2, value_if_true2], ...) checks multiple criteria without nested IF statements.",
        "difficulty": "EASY"
    },
    {
        "section": "MS Office",
        "topic": "Word",
        "subtopic": "Referencing",
        "question": "Which feature in Microsoft Word automatically generates a Table of Contents based on structured text?",
        "options": [
            {"id": "A", "text": "Hyperlink list"},
            {"id": "B", "text": "Bookmarks menu"},
            {"id": "C", "text": "Heading Styles (Heading 1, Heading 2, Heading 3)"},
            {"id": "D", "text": "Footnote citations"}
        ],
        "correctOptionId": "C",
        "explanation": "Word builds an automatic Table of Contents by scanning text formatted with predefined Heading 1, 2, and 3 styles.",
        "difficulty": "EASY"
    },

    # --- PSEUDOCODE ---
    {
        "section": "Pseudocode",
        "topic": "String Manipulation",
        "subtopic": "Palindrome Check",
        "question": "What is the output of the following pseudocode?\nString str = 'RADAR'\nInteger n = 5, flag = 1, i\nFor i = 0 to n / 2\n  If (str[i] != str[n - 1 - i])\n    flag = 0\n  End If\nEnd For\nPrint flag",
        "options": [
            {"id": "A", "text": "0"},
            {"id": "B", "text": "5"},
            {"id": "C", "text": "1"},
            {"id": "D", "text": "2"}
        ],
        "correctOptionId": "C",
        "explanation": "'RADAR' is a palindrome. All character comparisons (R==R, A==A, D==D) match, so flag remains 1.",
        "difficulty": "EASY"
    },
    {
        "section": "Pseudocode",
        "topic": "Recursion",
        "subtopic": "Fibonacci",
        "question": "What is the return value of fib(4)?\nInteger fib(Integer n)\n  If (n <= 1)\n    return n\n  End If\n  return fib(n - 1) + fib(n - 2)\nEnd function fib()",
        "options": [
            {"id": "A", "text": "2"},
            {"id": "B", "text": "5"},
            {"id": "C", "text": "3"},
            {"id": "D", "text": "4"}
        ],
        "correctOptionId": "C",
        "explanation": "Fibonacci sequence: fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2, fib(4)=3.",
        "difficulty": "EASY"
    },
    {
        "section": "Pseudocode",
        "topic": "Bitwise Operations",
        "subtopic": "Right Shift",
        "question": "What will be printed?\nInteger x = 40\nx = x >> 2\nPrint x",
        "options": [
            {"id": "A", "text": "80"},
            {"id": "B", "text": "20"},
            {"id": "C", "text": "160"},
            {"id": "D", "text": "10"}
        ],
        "correctOptionId": "D",
        "explanation": "Shifting right by 2 bits divides by 2^2 = 4. 40 / 4 = 10.",
        "difficulty": "EASY"
    },

    # --- COMPUTER FUNDAMENTALS & OS ---
    {
        "section": "Computer Fundamentals",
        "topic": "Processes & Threads",
        "subtopic": "Context Switching",
        "question": "What hardware registers and data must the Operating System save during a CPU Context Switch between two processes?",
        "options": [
            {"id": "A", "text": "Only the hard disk track sectors"},
            {"id": "B", "text": "The entire contents of the RAM memory modules"},
            {"id": "C", "text": "Process Control Block (PCB), Program Counter, and CPU registers"},
            {"id": "D", "text": "The network interface card buffer only"}
        ],
        "correctOptionId": "C",
        "explanation": "The PCB stores the program counter, CPU registers, stack pointers, and process state so execution can resume accurately.",
        "difficulty": "MEDIUM"
    },
    {
        "section": "Computer Fundamentals",
        "topic": "File Systems",
        "subtopic": "Inodes",
        "question": "In Unix/Linux file systems, what critical metadata is stored inside an Inode?",
        "options": [
            {"id": "A", "text": "File permissions, owner UID, file size, timestamps, and pointers to disk data blocks"},
            {"id": "B", "text": "The file name and full directory path string only"},
            {"id": "C", "text": "The cleartext password of the file creator"},
            {"id": "D", "text": "The BIOS bootloader code"}
        ],
        "correctOptionId": "A",
        "explanation": "Inodes store all file attributes and pointers to data blocks, while directory entries store the filename and map it to an inode number.",
        "difficulty": "MEDIUM"
    },

    # --- DBMS & SQL ---
    {
        "section": "DBMS",
        "topic": "Transaction Isolation",
        "subtopic": "Concurrency Anomalies",
        "question": "Which database transaction anomaly occurs when a transaction reads uncommitted data written by another concurrent transaction?",
        "options": [
            {"id": "A", "text": "Non-Repeatable Read"},
            {"id": "B", "text": "Phantom Read"},
            {"id": "C", "text": "Lost Update"},
            {"id": "D", "text": "Dirty Read"}
        ],
        "correctOptionId": "D",
        "explanation": "A Dirty Read occurs when Transaction A reads data modified by Transaction B that has not yet been committed (and may roll back).",
        "difficulty": "MEDIUM"
    },
    {
        "section": "DBMS",
        "topic": "SQL Clauses",
        "subtopic": "COALESCE",
        "question": "In SQL, what does the COALESCE(val1, val2, val3) function return?",
        "options": [
            {"id": "A", "text": "The average of all numeric parameters"},
            {"id": "B", "text": "The concatenated string of all inputs"},
            {"id": "C", "text": "The first non-null expression in its argument list"},
            {"id": "D", "text": "True if all arguments are null"}
        ],
        "correctOptionId": "C",
        "explanation": "COALESCE evaluates arguments in order and returns the first non-NULL value encountered.",
        "difficulty": "EASY"
    },

    # --- JAVA & OOP ---
    {
        "section": "Java",
        "topic": "Memory Management",
        "subtopic": "Garbage Collection",
        "question": "Which memory region in the Java Virtual Machine (JVM) is shared across all threads and stores all instantiated objects?",
        "options": [
            {"id": "A", "text": "Call Stack"},
            {"id": "B", "text": "Program Counter Register"},
            {"id": "C", "text": "Native Method Stack"},
            {"id": "D", "text": "Heap Memory"}
        ],
        "correctOptionId": "D",
        "explanation": "The JVM Heap is the shared runtime data area where all class instances and arrays are allocated and managed by Garbage Collection.",
        "difficulty": "EASY"
    },
    {
        "section": "Java",
        "topic": "Interfaces & Classes",
        "subtopic": "Abstract Classes",
        "question": "What is a defining rule of an Abstract Class in Java?",
        "options": [
            {"id": "A", "text": "It can be directly instantiated using the 'new' keyword"},
            {"id": "B", "text": "It cannot contain any concrete methods with implementations"},
            {"id": "C", "text": "It cannot be instantiated directly and must be subclassed to create objects"},
            {"id": "D", "text": "All its fields must be declared private and static"}
        ],
        "correctOptionId": "C",
        "explanation": "Abstract classes cannot be instantiated with 'new'; they serve as templates for concrete subclasses that implement abstract methods.",
        "difficulty": "EASY"
    },

    # --- DEVOPS ---
    {
        "section": "DevOps",
        "topic": "Git Commands",
        "subtopic": "Cherry-pick",
        "question": "Which Git command applies the changes introduced by a specific existing commit from another branch onto the current HEAD?",
        "options": [
            {"id": "A", "text": "git rebase --onto"},
            {"id": "B", "text": "git stash apply"},
            {"id": "C", "text": "git cherry-pick"},
            {"id": "D", "text": "git clone --single-branch"}
        ],
        "correctOptionId": "C",
        "explanation": "git cherry-pick <commit-hash> applies a specific commit's changes onto your active working branch.",
        "difficulty": "EASY"
    },
    {
        "section": "DevOps",
        "topic": "Container Orchestration",
        "subtopic": "Kubernetes Services",
        "question": "Which Kubernetes Service type exposes the service externally using a cloud provider's dedicated external load balancer?",
        "options": [
            {"id": "A", "text": "ClusterIP"},
            {"id": "B", "text": "NodePort"},
            {"id": "C", "text": "Headless Service"},
            {"id": "D", "text": "LoadBalancer"}
        ],
        "correctOptionId": "D",
        "explanation": "The LoadBalancer service type automatically provisions an external cloud load balancer (e.g. AWS NLB) directing to cluster nodes.",
        "difficulty": "EASY"
    },

    # --- COMMUNICATION ---
    {
        "section": "Communication",
        "topic": "Professional Vocabulary",
        "subtopic": "Corporate Idioms",
        "question": "In project management, what does the term 'Scope Creep' mean?",
        "options": [
            {"id": "A", "text": "Reducing project budget midway through development"},
            {"id": "B", "text": "Uncontrolled expansion of project deliverables and requirements without adjustments to time, budget, or resources"},
            {"id": "C", "text": "A team member quitting during a project cycle"},
            {"id": "D", "text": "Accelerating code deployment ahead of schedule"}
        ],
        "correctOptionId": "B",
        "explanation": "Scope creep refers to gradual, uncontrolled changes or continuous growth in project scope without corresponding budget/schedule increases.",
        "difficulty": "EASY"
    },
    {
        "section": "Communication",
        "topic": "Grammar",
        "subtopic": "Modal Verbs",
        "question": "Which modal verb best expresses a formal corporate recommendation or moral obligation?",
        "options": [
            {"id": "A", "text": "might"},
            {"id": "B", "text": "could"},
            {"id": "C", "text": "ought to"},
            {"id": "D", "text": "would"}
        ],
        "correctOptionId": "C",
        "explanation": "'Ought to' expresses duty, ethical correctness, or strong recommendation (e.g. 'Employees ought to report security incidents immediately').",
        "difficulty": "MEDIUM"
    }
]

with open('scripts/section_questions_data.py', 'r', encoding='utf-8') as f:
    content = f.read()

items_code = ""
for q in more_balanced:
    items_code += "        " + repr(q) + ",\n"

new_content = content.replace("    return data", f"    data.extend([\n{items_code}    ])\n    return data")

with open('scripts/section_questions_data.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Added {len(more_balanced)} more balanced questions to section_questions_data.py")
