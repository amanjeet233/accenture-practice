import re

# Additional verified questions with unique options and diverse answers
additional_pool = [
    # --- MS OFFICE ---
    {
        "section": "MS Office",
        "topic": "Excel",
        "subtopic": "Pivot Tables",
        "question": "Which component of an Excel PivotTable should a field be dragged into to display aggregated mathematical calculations (e.g. Total Revenue)?",
        "options": [
            {"id": "A", "text": "Rows area"},
            {"id": "B", "text": "Columns area"},
            {"id": "C", "text": "Values area"},
            {"id": "D", "text": "Filters area"}
        ],
        "correctOptionId": "C",
        "explanation": "The Values area calculates summaries such as Sum, Count, Average, Min, and Max from the underlying records.",
        "difficulty": "EASY"
    },
    {
        "section": "MS Office",
        "topic": "Excel",
        "subtopic": "Data Validation & Tools",
        "question": "Which keyboard shortcut in Microsoft Excel instantly opens the 'Create Table' dialog box for the selected dataset?",
        "options": [
            {"id": "A", "text": "Ctrl + T"},
            {"id": "B", "text": "Ctrl + Alt + T"},
            {"id": "C", "text": "Alt + F1"},
            {"id": "D", "text": "Shift + F11"}
        ],
        "correctOptionId": "A",
        "explanation": "Ctrl + T (or Ctrl + L) immediately converts an active range into a formatted Excel Table.",
        "difficulty": "EASY"
    },
    {
        "section": "MS Office",
        "topic": "Word",
        "subtopic": "Tracking & Collaboration",
        "question": "In Microsoft Word, what happens when 'Track Changes' is enabled?",
        "options": [
            {"id": "A", "text": "The document is locked against all edits"},
            {"id": "B", "text": "All insertions, deletions, and formatting modifications are highlighted and logged with author metadata"},
            {"id": "C", "text": "The file is uploaded automatically to OneDrive"},
            {"id": "D", "text": "Spelling mistakes are automatically deleted"}
        ],
        "correctOptionId": "B",
        "explanation": "Track Changes logs every editorial alteration, displaying strikethroughs, insertions, and timestamps for collaborative review.",
        "difficulty": "EASY"
    },
    {
        "section": "MS Office",
        "topic": "Outlook",
        "subtopic": "Rule Management",
        "question": "Which feature in Microsoft Outlook automatically moves incoming emails matching specific keywords into designated folders?",
        "options": [
            {"id": "A", "text": "AutoArchive"},
            {"id": "B", "text": "Quick Steps"},
            {"id": "C", "text": "Rules and Alerts"},
            {"id": "D", "text": "Mail Merge"}
        ],
        "correctOptionId": "C",
        "explanation": "Outlook Rules automate email processing based on sender, subject words, or recipient conditions upon arrival.",
        "difficulty": "EASY"
    },

    # --- NETWORKING ---
    {
        "section": "Networking",
        "topic": "VLANs",
        "subtopic": "IEEE Standards",
        "question": "Which IEEE standard governs VLAN tagging on Ethernet frames across trunk links?",
        "options": [
            {"id": "A", "text": "IEEE 802.11"},
            {"id": "B", "text": "IEEE 802.1Q"},
            {"id": "C", "text": "IEEE 802.3"},
            {"id": "D", "text": "IEEE 802.1X"}
        ],
        "correctOptionId": "B",
        "explanation": "IEEE 802.1Q inserts a 4-byte VLAN tag into Ethernet frames to preserve virtual network separation across trunk switches.",
        "difficulty": "MEDIUM"
    },
    {
        "section": "Networking",
        "topic": "DNS",
        "subtopic": "Record Types",
        "question": "Which DNS resource record specifies the mail exchange server responsible for accepting incoming emails for a domain?",
        "options": [
            {"id": "A", "text": "A Record"},
            {"id": "B", "text": "CNAME Record"},
            {"id": "C", "text": "TXT Record"},
            {"id": "D", "text": "MX Record"}
        ],
        "correctOptionId": "D",
        "explanation": "MX (Mail Exchange) records route emails directed to a domain to the appropriate mail host servers.",
        "difficulty": "EASY"
    },
    {
        "section": "Networking",
        "topic": "Network Security Devices",
        "subtopic": "IDS vs IPS",
        "question": "What is the key functional difference between an Intrusion Detection System (IDS) and an Intrusion Prevention System (IPS)?",
        "options": [
            {"id": "A", "text": "An IDS drops malicious packets inline, whereas an IPS only alerts administrators"},
            {"id": "B", "text": "An IDS operates out-of-band to alert on anomalies, while an IPS sits inline and actively blocks detected threats"},
            {"id": "C", "text": "An IDS only protects wireless networks, while an IPS is exclusively wired"},
            {"id": "D", "text": "An IDS decrypts SSL/TLS, whereas an IPS cannot inspect encrypted packets"}
        ],
        "correctOptionId": "B",
        "explanation": "IDS detects and generates alerts passively out-of-band, while IPS is situated inline to actively terminate attack connections.",
        "difficulty": "MEDIUM"
    },

    # --- CYBERSECURITY ---
    {
        "section": "Cybersecurity",
        "topic": "Password Security",
        "subtopic": "Salting",
        "question": "Why is a cryptographic 'salt' appended to user passwords before hashing?",
        "options": [
            {"id": "A", "text": "To compress the password into a shorter bit sequence"},
            {"id": "B", "text": "To foil precomputed dictionary and Rainbow Table attacks by ensuring identical passwords have unique hash outputs"},
            {"id": "C", "text": "To allow the system administrator to reverse-engineer forgotten passwords"},
            {"id": "D", "text": "To convert the hash into symmetric ciphertext"}
        ],
        "correctOptionId": "B",
        "explanation": "Salting adds unique random strings to plaintext passwords before hashing, rendering precomputed rainbow tables useless.",
        "difficulty": "MEDIUM"
    },
    {
        "section": "Cybersecurity",
        "topic": "Web Application Vulnerabilities",
        "subtopic": "Cross-Site Scripting (XSS)",
        "question": "What occurs during a Stored (Persistent) Cross-Site Scripting (XSS) attack?",
        "options": [
            {"id": "A", "text": "Malicious payload is permanently saved in the application database and executed in the browser of any user viewing the affected page"},
            {"id": "B", "text": "The attacker floods the web server with SYN packets"},
            {"id": "C", "text": "Database tables are dropped via unsanitized SQL commands"},
            {"id": "D", "text": "The web server's private SSL key is extracted from memory"}
        ],
        "correctOptionId": "A",
        "explanation": "Stored XSS embeds malicious JavaScript permanently into persistent storage (e.g. comment feed), triggering on victim visits.",
        "difficulty": "MEDIUM"
    },
    {
        "section": "Cybersecurity",
        "topic": "Security Architecture",
        "subtopic": "Zero Trust",
        "question": "What is the foundational principle of a 'Zero Trust' network architecture?",
        "options": [
            {"id": "A", "text": "Trust all internal network traffic behind the perimeter firewall"},
            {"id": "B", "text": "Never trust, always verify every access request regardless of origin"},
            {"id": "C", "text": "Eliminate multi-factor authentication for corporate devices"},
            {"id": "D", "text": "Encrypt only outbound public traffic"}
        ],
        "correctOptionId": "B",
        "explanation": "Zero Trust operates on 'never trust, always verify'—requiring continuous authentication, authorization, and microsegmentation.",
        "difficulty": "EASY"
    },

    # --- CLOUD COMPUTING ---
    {
        "section": "Cloud",
        "topic": "Serverless",
        "subtopic": "FaaS Architecture",
        "question": "Which core operational benefit defines Serverless Computing (Function-as-a-Service, e.g. AWS Lambda)?",
        "options": [
            {"id": "A", "text": "Dedicated physical servers assigned 24/7 to the tenant"},
            {"id": "B", "text": "Automatic scaling with event-driven execution and zero cost when code is idle"},
            {"id": "C", "text": "Manual operating system patch scheduling required every weekend"},
            {"id": "D", "text": "Unlimited continuous execution time without timeouts"}
        ],
        "correctOptionId": "B",
        "explanation": "Serverless architectures scale automatically from zero to thousands of parallel requests and charge only during active compute runs.",
        "difficulty": "EASY"
    },
    {
        "section": "Cloud",
        "topic": "Object Storage",
        "subtopic": "Storage Tiers",
        "question": "Which cloud storage class is specifically optimized for long-term data archiving with retrieval times measured in hours at minimum cost?",
        "options": [
            {"id": "A", "text": "Standard Multi-Region Storage"},
            {"id": "B", "text": "Coldline / Glacier Deep Archive"},
            {"id": "C", "text": "Solid-State Drive Block Storage"},
            {"id": "D", "text": "In-Memory Caching Cluster"}
        ],
        "correctOptionId": "B",
        "explanation": "Glacier Deep Archive provides ultra-low cost storage for compliance/backup records accessed infrequently with multi-hour retrieval.",
        "difficulty": "EASY"
    },
    {
        "section": "Cloud",
        "topic": "Virtualization",
        "subtopic": "Hypervisors",
        "question": "What characterizes a Type-1 (Bare-Metal) Hypervisor compared to a Type-2 (Hosted) Hypervisor?",
        "options": [
            {"id": "A", "text": "It executes directly on the physical host hardware without an underlying host operating system"},
            {"id": "B", "text": "It runs as an application on top of Windows or Linux"},
            {"id": "C", "text": "It only supports containerization, not virtual machines"},
            {"id": "D", "text": "It has lower throughput and higher latency than hosted software"}
        ],
        "correctOptionId": "A",
        "explanation": "Type-1 hypervisors (e.g. VMware ESXi, KVM) run directly on bare metal hardware, providing superior enterprise performance.",
        "difficulty": "MEDIUM"
    },

    # --- PSEUDOCODE ---
    {
        "section": "Pseudocode",
        "topic": "Bitwise Operations",
        "subtopic": "AND Masking",
        "question": "What is the output of the following pseudocode?\nInteger a, b, c\nSet a = 14, b = 7\nc = a & b\nPrint c",
        "options": [
            {"id": "A", "text": "6"},
            {"id": "B", "text": "14"},
            {"id": "C", "text": "7"},
            {"id": "D", "text": "0"}
        ],
        "correctOptionId": "A",
        "explanation": "14 = 1110 in binary, 7 = 0111. 1110 & 0111 = 0110 in binary, which is decimal 6.",
        "difficulty": "EASY"
    },
    {
        "section": "Pseudocode",
        "topic": "Nested Loops",
        "subtopic": "Execution Count",
        "question": "How many times will 'Accenture' be printed?\nInteger i, j\nFor i = 1 to 3\n  For j = 1 to i\n    Print 'Accenture'\n  End For\nEnd For",
        "options": [
            {"id": "A", "text": "9 times"},
            {"id": "B", "text": "6 times"},
            {"id": "C", "text": "3 times"},
            {"id": "D", "text": "12 times"}
        ],
        "correctOptionId": "B",
        "explanation": "When i=1: j runs 1 time. When i=2: j runs 2 times. When i=3: j runs 3 times. Total = 1 + 2 + 3 = 6 times.",
        "difficulty": "EASY"
    },
    {
        "section": "Pseudocode",
        "topic": "Array Manipulation",
        "subtopic": "Pointer Arithmetic",
        "question": "What is printed by this pseudocode?\nInteger arr[4] = {10, 20, 30, 40}\nInteger res = arr[0] + arr[3] - arr[1]\nPrint res",
        "options": [
            {"id": "A", "text": "20"},
            {"id": "B", "text": "40"},
            {"id": "C", "text": "30"},
            {"id": "D", "text": "50"}
        ],
        "correctOptionId": "C",
        "explanation": "arr[0] is 10, arr[3] is 40, arr[1] is 20. Calculation: 10 + 40 - 20 = 30.",
        "difficulty": "EASY"
    },

    # --- COMPUTER FUNDAMENTALS & OS ---
    {
        "section": "Computer Fundamentals",
        "topic": "Process Scheduling",
        "subtopic": "Round Robin",
        "question": "What key metric determines process time-slice duration in Round Robin CPU scheduling?",
        "options": [
            {"id": "A", "text": "Priority weight"},
            {"id": "B", "text": "Time Quantum"},
            {"id": "C", "text": "Burst duration limit"},
            {"id": "D", "text": "I/O wait threshold"}
        ],
        "correctOptionId": "B",
        "explanation": "In Round Robin scheduling, the CPU is assigned to each ready process in cyclic order for a fixed unit of time called the Time Quantum.",
        "difficulty": "EASY"
    },
    {
        "section": "Computer Fundamentals",
        "topic": "Synchronization",
        "subtopic": "Mutual Exclusion",
        "question": "What is the primary difference between a Mutex and a Counting Semaphore?",
        "options": [
            {"id": "A", "text": "A Mutex is a locking mechanism allowing only one thread access at a time, whereas a Counting Semaphore allows up to N concurrent threads"},
            {"id": "B", "text": "A Mutex runs in user space, while a Semaphore runs only in GPU registers"},
            {"id": "C", "text": "A Semaphore can never cause deadlocks"},
            {"id": "D", "text": "A Mutex cannot be unlocked by the thread that locked it"}
        ],
        "correctOptionId": "A",
        "explanation": "A Mutex has ownership and restricts access to a single thread (binary 0/1), while a counting semaphore tracks N available resources.",
        "difficulty": "MEDIUM"
    },

    # --- DBMS & SQL ---
    {
        "section": "DBMS",
        "topic": "Normalization",
        "subtopic": "Third Normal Form",
        "question": "To satisfy Third Normal Form (3NF), what must a relation satisfy in addition to being in 2NF?",
        "options": [
            {"id": "A", "text": "Contain no repeating groups or multivalued attributes"},
            {"id": "B", "text": "Have no transitive functional dependencies for non-prime attributes"},
            {"id": "C", "text": "Ensure every determinant is a superkey"},
            {"id": "D", "text": "Contain at least three foreign keys"}
        ],
        "correctOptionId": "B",
        "explanation": "3NF requires a table to be in 2NF and have no transitive dependencies (no non-prime attribute depending on another non-prime attribute).",
        "difficulty": "MEDIUM"
    },
    {
        "section": "DBMS",
        "topic": "Indexing",
        "subtopic": "Clustered Indexes",
        "question": "How many Clustered Indexes can exist on a single relational database table?",
        "options": [
            {"id": "A", "text": "Exactly one, because it physically reorders the actual data rows on disk"},
            {"id": "B", "text": "Up to 16 clustered indexes"},
            {"id": "C", "text": "An unlimited number"},
            {"id": "D", "text": "Zero, clustered indexes only exist on views"}
        ],
        "correctOptionId": "A",
        "explanation": "A table can have only one clustered index because the data rows themselves can be physically sorted in only one order on disk.",
        "difficulty": "EASY"
    },

    # --- JAVA & OOP ---
    {
        "section": "Java",
        "topic": "Exception Handling",
        "subtopic": "Checked vs Unchecked",
        "question": "Which of the following exceptions is an Unchecked Exception (subclass of RuntimeException) in Java?",
        "options": [
            {"id": "A", "text": "IOException"},
            {"id": "B", "text": "SQLException"},
            {"id": "C", "text": "NullPointerException"},
            {"id": "D", "text": "ClassNotFoundException"}
        ],
        "correctOptionId": "C",
        "explanation": "NullPointerException extends RuntimeException, making it an unchecked exception that does not require mandatory try-catch or throws.",
        "difficulty": "EASY"
    },
    {
        "section": "Java",
        "topic": "Collections Framework",
        "subtopic": "HashMap Internals",
        "question": "What is the average time complexity for get() and put() operations in a well-distributed Java HashMap?",
        "options": [
            {"id": "A", "text": "O(log N)"},
            {"id": "B", "text": "O(1)"},
            {"id": "C", "text": "O(N)"},
            {"id": "D", "text": "O(N log N)"}
        ],
        "correctOptionId": "B",
        "explanation": "HashMaps compute bucket index via hashCode(), achieving O(1) constant time average performance for lookup and insertion.",
        "difficulty": "EASY"
    },

    # --- DEVOPS ---
    {
        "section": "DevOps",
        "topic": "Containers",
        "subtopic": "Docker Architecture",
        "question": "What is the key structural difference between a Docker container and a traditional Virtual Machine?",
        "options": [
            {"id": "A", "text": "Containers share the host operating system kernel, whereas VMs run a complete guest OS on top of a hypervisor"},
            {"id": "B", "text": "VMs startup in milliseconds, while containers take several minutes"},
            {"id": "C", "text": "Containers require their own dedicated hypervisor hardware"},
            {"id": "D", "text": "Docker cannot run on Linux systems"}
        ],
        "correctOptionId": "A",
        "explanation": "Containers share the host OS kernel and isolate user spaces via cgroups/namespaces, making them much lighter than full guest VMs.",
        "difficulty": "EASY"
    },
    {
        "section": "DevOps",
        "topic": "Kubernetes",
        "subtopic": "Core Abstractions",
        "question": "What is the smallest deployable computing unit that can be created and managed in Kubernetes?",
        "options": [
            {"id": "A", "text": "Service"},
            {"id": "B", "text": "Node"},
            {"id": "C", "text": "Pod"},
            {"id": "D", "text": "Deployment"}
        ],
        "correctOptionId": "C",
        "explanation": "A Pod encapsulates one or more containers, storage resources, and unique network IP in Kubernetes cluster orchestration.",
        "difficulty": "EASY"
    },

    # --- COMMUNICATION ---
    {
        "section": "Communication",
        "topic": "Grammar",
        "subtopic": "Prepositions",
        "question": "Identify the correct preposition: 'The team must strictly abide ________ corporate security regulations.'",
        "options": [
            {"id": "A", "text": "to"},
            {"id": "B", "text": "by"},
            {"id": "C", "text": "with"},
            {"id": "D", "text": "for"}
        ],
        "correctOptionId": "B",
        "explanation": "The phrasal verb 'abide by' means to accept or obey a rule, decision, or recommendation.",
        "difficulty": "EASY"
    },
    {
        "section": "Communication",
        "topic": "Grammar",
        "subtopic": "Conditionals",
        "question": "Complete the third conditional sentence correctly: 'If the database administrator ________ the patch earlier, the system crash would not have occurred.'",
        "options": [
            {"id": "A", "text": "applied"},
            {"id": "B", "text": "applies"},
            {"id": "C", "text": "had applied"},
            {"id": "D", "text": "has applied"}
        ],
        "correctOptionId": "C",
        "explanation": "Third conditional structures follow: If + past perfect (had applied), ... would have + past participle.",
        "difficulty": "MEDIUM"
    }
]

# Read existing section_questions_data.py
with open('scripts/section_questions_data.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Append to data list right before `return data`
items_code = ""
for q in additional_pool:
    items_code += "        " + repr(q) + ",\n"

new_content = content.replace("    return data", f"    data.extend([\n{items_code}    ])\n    return data")

with open('scripts/section_questions_data.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Added {len(additional_pool)} more verified questions to section_questions_data.py")
