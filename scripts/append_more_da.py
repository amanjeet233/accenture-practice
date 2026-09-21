more_da = [
    # --- MS OFFICE ---
    {
        "section": "MS Office",
        "topic": "Excel",
        "subtopic": "Keyboard Shortcuts",
        "question": "Which keyboard shortcut toggles between displaying cell values and displaying formula syntax in Excel?",
        "options": [
            {"id": "A", "text": "Ctrl + ` (Backquote)"},
            {"id": "B", "text": "Ctrl + F9"},
            {"id": "C", "text": "Alt + Enter"},
            {"id": "D", "text": "Shift + F3"}
        ],
        "correctOptionId": "A",
        "explanation": "Ctrl + ` (grave accent/backquote) toggles formula auditing view, showing all formulas in cells instead of calculated results.",
        "difficulty": "EASY"
    },
    {
        "section": "MS Office",
        "topic": "Word",
        "subtopic": "Special Characters",
        "question": "What is the default shortcut key combination to insert the Copyright symbol (©) in Microsoft Word?",
        "options": [
            {"id": "A", "text": "Ctrl + C"},
            {"id": "B", "text": "Alt + C"},
            {"id": "C", "text": "Shift + C"},
            {"id": "D", "text": "Ctrl + Alt + C"}
        ],
        "correctOptionId": "D",
        "explanation": "Ctrl + Alt + C immediately inserts the copyright symbol (©) in Microsoft Word.",
        "difficulty": "EASY"
    },

    # --- NETWORKING ---
    {
        "section": "Networking",
        "topic": "Transport Layer",
        "subtopic": "UDP Characteristics",
        "question": "Which of the following transport layer characteristics specifically describes the User Datagram Protocol (UDP)?",
        "options": [
            {"id": "A", "text": "Connectionless, low-overhead transmission without delivery guarantees or retransmission"},
            {"id": "B", "text": "Strict three-way handshake and guaranteed packet ordering"},
            {"id": "C", "text": "Windowing flow control and congestion collapse backoff"},
            {"id": "D", "text": "Full-duplex byte stream acknowledgement"}
        ],
        "correctOptionId": "A",
        "explanation": "UDP is lightweight, connectionless, and best-effort; it does not perform handshakes or retransmissions, ideal for streaming/gaming/DNS.",
        "difficulty": "EASY"
    },
    {
        "section": "Networking",
        "topic": "Switching",
        "subtopic": "Forwarding Tables",
        "question": "What data structure does a Layer 2 network switch dynamically build to map hardware addresses to specific physical ports?",
        "options": [
            {"id": "A", "text": "Routing Information Base (RIB)"},
            {"id": "B", "text": "ARP Cache"},
            {"id": "C", "text": "DNS Zone Table"},
            {"id": "D", "text": "CAM (Content Addressable Memory) / MAC Address Table"}
        ],
        "correctOptionId": "D",
        "explanation": "Switches record incoming source MAC addresses and ingress ports in the CAM / MAC address table for frame forwarding.",
        "difficulty": "MEDIUM"
    },

    # --- CYBERSECURITY ---
    {
        "section": "Cybersecurity",
        "topic": "Network Security",
        "subtopic": "Honeypots",
        "question": "What is the primary operational purpose of deploying a 'Honeypot' in an enterprise network?",
        "options": [
            {"id": "A", "text": "To accelerate database indexing speeds"},
            {"id": "B", "text": "To replace perimeter firewalls"},
            {"id": "C", "text": "To store production source code repositories"},
            {"id": "D", "text": "To lure, detect, and study unauthorized attacker activity in an isolated decoy system"}
        ],
        "correctOptionId": "D",
        "explanation": "Honeypots act as decoy resources with no legitimate business traffic, so any interaction indicates adversarial or unauthorized probing.",
        "difficulty": "EASY"
    },
    {
        "section": "Cybersecurity",
        "topic": "Cryptography",
        "subtopic": "Digital Signatures",
        "question": "Which two core security objectives are achieved when a sender attaches a Digital Signature to a document?",
        "options": [
            {"id": "A", "text": "Authentication and Non-Repudiation with Integrity"},
            {"id": "B", "text": "Payload compression and rate limiting"},
            {"id": "C", "text": "High throughput and port forwarding"},
            {"id": "D", "text": "DNS resolution and NAT traversal"}
        ],
        "correctOptionId": "A",
        "explanation": "Digital signatures prove authenticity of the sender (using sender's private key), ensure document integrity, and enforce non-repudiation.",
        "difficulty": "MEDIUM"
    },

    # --- CLOUD COMPUTING ---
    {
        "section": "Cloud",
        "topic": "Cloud Networking",
        "subtopic": "Security Groups",
        "question": "In cloud VPC architecture (e.g. AWS Security Groups), what is the default behavior regarding statefulness?",
        "options": [
            {"id": "A", "text": "They are completely stateless, requiring manual inbound and outbound rules for return traffic"},
            {"id": "B", "text": "They cannot filter inbound traffic based on port numbers"},
            {"id": "C", "text": "They operate only at Layer 7 of the OSI model"},
            {"id": "D", "text": "They are stateful: return traffic for allowed inbound requests is automatically permitted outbound"}
        ],
        "correctOptionId": "D",
        "explanation": "Security Groups are stateful virtual firewalls; return traffic is automatically tracked and allowed regardless of outbound rules.",
        "difficulty": "MEDIUM"
    },
    {
        "section": "Cloud",
        "topic": "Compute",
        "subtopic": "Autoscaling",
        "question": "What triggering mechanism causes an Auto Scaling Group to launch additional cloud VM instances during peak traffic?",
        "options": [
            {"id": "A", "text": "A CloudWatch metric alarm (e.g. average CPU utilization exceeding 75%)"},
            {"id": "B", "text": "Physical hardware server temperature alerts"},
            {"id": "C", "text": "Manual restart of DNS root servers"},
            {"id": "D", "text": "Expiration of SSL certificates"}
        ],
        "correctOptionId": "A",
        "explanation": "Auto Scaling Groups monitor telemetry alarms (such as average CPU utilization or request queue depth) to scale instances up or down dynamically.",
        "difficulty": "EASY"
    },

    # --- PSEUDOCODE ---
    {
        "section": "Pseudocode",
        "topic": "Bitwise Operations",
        "subtopic": "Power of Two Check",
        "question": "What does the expression '(n & (n - 1)) == 0' determine for a positive integer n?",
        "options": [
            {"id": "A", "text": "Whether n is an odd number"},
            {"id": "B", "text": "Whether n is a prime number"},
            {"id": "C", "text": "Whether n is negative"},
            {"id": "D", "text": "Whether n is an exact power of two"}
        ],
        "correctOptionId": "D",
        "explanation": "Powers of two have exactly one bit set in binary (e.g. 8 is 1000, 7 is 0111). n & (n - 1) clears the lowest set bit, yielding 0.",
        "difficulty": "MEDIUM"
    },
    {
        "section": "Pseudocode",
        "topic": "Recursion",
        "subtopic": "Power Function",
        "question": "What will be the output of power(2, 3)?\nInteger power(Integer base, Integer exp)\n  If (exp == 0)\n    return 1\n  End If\n  return base * power(base, exp - 1)\nEnd function",
        "options": [
            {"id": "A", "text": "6"},
            {"id": "B", "text": "9"},
            {"id": "C", "text": "4"},
            {"id": "D", "text": "8"}
        ],
        "correctOptionId": "D",
        "explanation": "power(2, 3) computes 2 * power(2, 2) = 2 * (2 * power(2, 1)) = 2 * 2 * 2 = 8.",
        "difficulty": "EASY"
    },

    # --- COMPUTER FUNDAMENTALS & OS ---
    {
        "section": "Computer Fundamentals",
        "topic": "Computer Architecture",
        "subtopic": "Von Neumann Architecture",
        "question": "What defining principle characterizes the classic Von Neumann computer architecture?",
        "options": [
            {"id": "A", "text": "Program instructions and data share the same unified physical memory space and bus system"},
            {"id": "B", "text": "Instructions are permanently hardwired into silicon without memory"},
            {"id": "C", "text": "Separate physical buses and memories are strictly required for code and data"},
            {"id": "D", "text": "The CPU does not possess an Arithmetic Logic Unit"}
        ],
        "correctOptionId": "A",
        "explanation": "Von Neumann architecture stores both program instructions and user data in the same unified read-write memory space.",
        "difficulty": "EASY"
    },
    {
        "section": "Computer Fundamentals",
        "topic": "Operating Systems",
        "subtopic": "Disk Scheduling",
        "question": "Which disk scheduling algorithm moves the disk arm across all tracks servicing requests, reversing direction only when the end is reached?",
        "options": [
            {"id": "A", "text": "FCFS"},
            {"id": "B", "text": "SSTF (Shortest Seek Time First)"},
            {"id": "C", "text": "FIFO"},
            {"id": "D", "text": "SCAN (Elevator Algorithm)"}
        ],
        "correctOptionId": "D",
        "explanation": "The SCAN algorithm services track requests in one direction toward the edge of the disk and then sweeps backward like an elevator.",
        "difficulty": "EASY"
    },

    # --- DBMS & SQL ---
    {
        "section": "DBMS",
        "topic": "SQL Window Functions",
        "subtopic": "Ranking",
        "question": "Which SQL window function assigns consecutive ranks without skipping rank numbers when ties occur?",
        "options": [
            {"id": "A", "text": "RANK()"},
            {"id": "B", "text": "ROW_NUMBER()"},
            {"id": "C", "text": "NTILE()"},
            {"id": "D", "text": "DENSE_RANK()"}
        ],
        "correctOptionId": "D",
        "explanation": "DENSE_RANK() assigns identical ranks to ties and continues with the immediate next integer (e.g. 1, 2, 2, 3), whereas RANK() skips (1, 2, 2, 4).",
        "difficulty": "MEDIUM"
    },
    {
        "section": "DBMS",
        "topic": "Database Architecture",
        "subtopic": "Views",
        "question": "What is a Materialized View in enterprise relational database systems?",
        "options": [
            {"id": "A", "text": "A temporary table that deletes itself after 5 seconds"},
            {"id": "B", "text": "A virtual query definition that does not store any data physically on disk"},
            {"id": "C", "text": "A stored query whose result set is physically saved on disk and can be refreshed periodically for fast querying"},
            {"id": "D", "text": "A database index created only on primary keys"}
        ],
        "correctOptionId": "C",
        "explanation": "Materialized views persist query results on disk, avoiding repeated computation of complex joins and aggregations at query time.",
        "difficulty": "MEDIUM"
    },

    # --- JAVA & OOP ---
    {
        "section": "Java",
        "topic": "Java Concurrency",
        "subtopic": "Volatile Keyword",
        "question": "What guarantee does the 'volatile' keyword provide for a variable in multithreaded Java applications?",
        "options": [
            {"id": "A", "text": "All reads and writes go directly to main memory, ensuring immediate visibility across all CPU caches"},
            {"id": "B", "text": "The variable is protected by an automatic reentrant mutual exclusion lock"},
            {"id": "C", "text": "Compound operations like count++ become strictly atomic"},
            {"id": "D", "text": "The variable cannot be garbage collected"}
        ],
        "correctOptionId": "A",
        "explanation": "volatile establishes happens-before visibility guarantees by flushing reads and writes directly to main memory rather than thread local caches.",
        "difficulty": "MEDIUM"
    },
    {
        "section": "Java",
        "topic": "Collections",
        "subtopic": "Set Implementations",
        "question": "Which Java Set implementation guarantees that elements are maintained in sorted ascending natural order?",
        "options": [
            {"id": "A", "text": "HashSet"},
            {"id": "B", "text": "LinkedHashSet"},
            {"id": "C", "text": "CopyOnWriteArraySet"},
            {"id": "D", "text": "TreeSet"}
        ],
        "correctOptionId": "D",
        "explanation": "TreeSet is backed by a Red-Black Tree, guaranteeing ascending sorted traversal order according to Comparable or Comparator.",
        "difficulty": "EASY"
    },

    # --- DEVOPS ---
    {
        "section": "DevOps",
        "topic": "Version Control",
        "subtopic": "Git Stash",
        "question": "Which command in Git temporarily shelves uncommitted local modifications so the working tree matches the HEAD commit?",
        "options": [
            {"id": "A", "text": "git reset --hard"},
            {"id": "B", "text": "git clean -fd"},
            {"id": "C", "text": "git revert HEAD"},
            {"id": "D", "text": "git stash"}
        ],
        "correctOptionId": "D",
        "explanation": "git stash saves dirty working state on a storage stack and reverts working directory to clean HEAD state.",
        "difficulty": "EASY"
    },
    {
        "section": "DevOps",
        "topic": "Continuous Delivery",
        "subtopic": "Blue-Green Deployment",
        "question": "What is the primary benefit of a Blue-Green deployment architecture?",
        "options": [
            {"id": "A", "text": "Eliminating software testing requirements"},
            {"id": "B", "text": "Near-zero downtime deployment and instantaneous rollback capability by switching router traffic between identical environments"},
            {"id": "C", "text": "Halving cloud infrastructure hardware costs"},
            {"id": "D", "text": "Automatically refactoring legacy code into serverless functions"}
        ],
        "correctOptionId": "B",
        "explanation": "Blue-Green deployment runs two identical production environments (Blue active, Green new release); traffic is cut over instantly via load balancer.",
        "difficulty": "EASY"
    },

    # --- COMMUNICATION ---
    {
        "section": "Communication",
        "topic": "Sentence Correction",
        "subtopic": "Parallelism",
        "question": "Select the sentence that maintains correct grammatical Parallel Structure:",
        "options": [
            {"id": "A", "text": "The candidate enjoys debugging code, designing architectures, and to write tests."},
            {"id": "B", "text": "The candidate enjoys debugging code, designing architectures, and writing tests."},
            {"id": "C", "text": "The candidate enjoys to debug code, designing architectures, and writes tests."},
            {"id": "D", "text": "The candidate enjoys debug, design, and writing test cases."}
        ],
        "correctOptionId": "B",
        "explanation": "Parallel structure requires series items to share the same grammatical form (gerunds: debugging, designing, writing).",
        "difficulty": "MEDIUM"
    },
    {
        "section": "Communication",
        "topic": "Professional Vocabulary",
        "subtopic": "Precision",
        "question": "Choose the word that best completes the sentence: 'The engineering director gave her ________ to proceed with the database migration schedule.'",
        "options": [
            {"id": "A", "text": "ascent"},
            {"id": "B", "text": "accent"},
            {"id": "C", "text": "assent"},
            {"id": "D", "text": "access"}
        ],
        "correctOptionId": "C",
        "explanation": "'Assent' means official agreement or approval. ('Ascent' refers to upward climbing; 'accent' refers to pronunciation).",
        "difficulty": "MEDIUM"
    }
]

with open('scripts/section_questions_data.py', 'r', encoding='utf-8') as f:
    content = f.read()

items_code = ""
for q in more_da:
    items_code += "        " + repr(q) + ",\n"

new_content = content.replace("    return data", f"    data.extend([\n{items_code}    ])\n    return data")

with open('scripts/section_questions_data.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Added {len(more_da)} more D & A questions to section_questions_data.py")
