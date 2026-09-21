# Verified, unique Accenture-pattern assessment questions
# Every question has its OWN 4 UNIQUE options and its OWN VERIFIED answer.
# Varied answer distribution across A, B, C, D.

def get_additional_verified_questions():
    data = [
        # =====================================================================
        # MS OFFICE / COMMON APPLICATIONS
        # =====================================================================
        {
            "section": "MS Office",
            "topic": "Excel",
            "subtopic": "Lookup & Reference Functions",
            "question": "Which Excel function combines VLOOKUP and HLOOKUP capabilities, works in any direction, and defaults to an exact match?",
            "options": [
                {"id": "A", "text": "XLOOKUP"},
                {"id": "B", "text": "INDEX/MATCH"},
                {"id": "C", "text": "LOOKUP"},
                {"id": "D", "text": "OFFSET"}
            ],
            "correctOptionId": "A",
            "explanation": "XLOOKUP replaced VLOOKUP and HLOOKUP, supporting searches in any direction with default exact matching.",
            "difficulty": "EASY"
        },
        {
            "section": "MS Office",
            "topic": "Excel",
            "subtopic": "Statistical & Math Functions",
            "question": "In Excel, which formula sums cells in D2:D20 where A2:A20 is 'East' and B2:B20 is 'Sales'?",
            "options": [
                {"id": "A", "text": "=SUMIF(D2:D20, 'East', 'Sales')"},
                {"id": "B", "text": "=SUMIFS(D2:D20, A2:A20, 'East', B2:B20, 'Sales')"},
                {"id": "C", "text": "=COUNTIFS(D2:D20, A2:A20, 'East', B2:B20, 'Sales')"},
                {"id": "D", "text": "=TOTALIFS(D2:D20, A2:A20, 'East', B2:B20, 'Sales')"}
            ],
            "correctOptionId": "B",
            "explanation": "SUMIFS syntax is =SUMIFS(sum_range, criteria_range1, criteria1, criteria_range2, criteria2).",
            "difficulty": "MEDIUM"
        },
        {
            "section": "MS Office",
            "topic": "Word",
            "subtopic": "Document Formatting",
            "question": "What is the primary function of a Continuous Section Break in Microsoft Word?",
            "options": [
                {"id": "A", "text": "Starts a new page immediately"},
                {"id": "B", "text": "Inserts a blank page into the document"},
                {"id": "C", "text": "Enables different column layouts or margins on the same physical page"},
                {"id": "D", "text": "Forces the document into landscape orientation for all pages"}
            ],
            "correctOptionId": "C",
            "explanation": "Continuous Section Breaks allow changing margins, columns, or headers/footers without starting a new page.",
            "difficulty": "MEDIUM"
        },
        {
            "section": "MS Office",
            "topic": "PowerPoint",
            "subtopic": "Slide Masters",
            "question": "Where should a presenter modify fonts, logos, and background styles once so they automatically apply to all slides?",
            "options": [
                {"id": "A", "text": "Slide Sorter View"},
                {"id": "B", "text": "Outline View"},
                {"id": "C", "text": "Notes Master"},
                {"id": "D", "text": "Slide Master View"}
            ],
            "correctOptionId": "D",
            "explanation": "The Slide Master controls the default design, themes, fonts, and placeholders across all slides.",
            "difficulty": "EASY"
        },
        {
            "section": "MS Office",
            "topic": "Outlook",
            "subtopic": "Email Delivery & Protocol",
            "question": "When configuring an email account in Outlook, which protocol downloads emails to the client and deletes them from the server by default?",
            "options": [
                {"id": "A", "text": "IMAP"},
                {"id": "B", "text": "POP3"},
                {"id": "C", "text": "SMTP"},
                {"id": "D", "text": "MAPI"}
            ],
            "correctOptionId": "B",
            "explanation": "POP3 (Post Office Protocol 3) downloads messages locally and by default removes them from the server.",
            "difficulty": "MEDIUM"
        },

        # =====================================================================
        # NETWORKING
        # =====================================================================
        {
            "section": "Networking",
            "topic": "OSI Model",
            "subtopic": "Transport Layer",
            "question": "Which layer of the OSI model handles end-to-end communication, flow control, error recovery, and port addressing?",
            "options": [
                {"id": "A", "text": "Network Layer"},
                {"id": "B", "text": "Data Link Layer"},
                {"id": "C", "text": "Transport Layer"},
                {"id": "D", "text": "Session Layer"}
            ],
            "correctOptionId": "C",
            "explanation": "The Transport Layer (Layer 4) is responsible for end-to-end connection, reliability, segmentation, and flow control.",
            "difficulty": "EASY"
        },
        {
            "section": "Networking",
            "topic": "IP Addressing",
            "subtopic": "Subnetting",
            "question": "What is the usable host capacity of an IPv4 subnet with a CIDR prefix of /28?",
            "options": [
                {"id": "A", "text": "16 hosts"},
                {"id": "B", "text": "14 hosts"},
                {"id": "C", "text": "30 hosts"},
                {"id": "D", "text": "6 hosts"}
            ],
            "correctOptionId": "B",
            "explanation": "A /28 subnet has 32 - 28 = 4 host bits. 2^4 = 16 addresses, minus 2 (network & broadcast) = 14 usable hosts.",
            "difficulty": "MEDIUM"
        },
        {
            "section": "Networking",
            "topic": "Routing Protocols",
            "subtopic": "Interior Gateway Protocols",
            "question": "Which routing protocol utilizes Dijkstra's Shortest Path First (SPF) algorithm and operates as a link-state protocol?",
            "options": [
                {"id": "A", "text": "RIP"},
                {"id": "B", "text": "BGP"},
                {"id": "C", "text": "OSPF"},
                {"id": "D", "text": "EGP"}
            ],
            "correctOptionId": "C",
            "explanation": "OSPF (Open Shortest Path First) is a link-state IGP that calculates shortest paths using Dijkstra's algorithm.",
            "difficulty": "MEDIUM"
        },
        {
            "section": "Networking",
            "topic": "Protocols",
            "subtopic": "Resolution Protocols",
            "question": "What protocol maps a known IPv4 address to its corresponding physical MAC hardware address?",
            "options": [
                {"id": "A", "text": "RARP"},
                {"id": "B", "text": "DHCP"},
                {"id": "C", "text": "ICMP"},
                {"id": "D", "text": "ARP"}
            ],
            "correctOptionId": "D",
            "explanation": "ARP (Address Resolution Protocol) resolves logical IP addresses to 48-bit MAC addresses on local networks.",
            "difficulty": "EASY"
        },
        {
            "section": "Networking",
            "topic": "Transport Protocols",
            "subtopic": "TCP Handshake",
            "question": "In what exact sequence are control flags exchanged during the standard TCP connection establishment?",
            "options": [
                {"id": "A", "text": "SYN -> SYN-ACK -> ACK"},
                {"id": "B", "text": "ACK -> SYN -> ACK"},
                {"id": "C", "text": "SYN -> ACK -> FIN"},
                {"id": "D", "text": "FIN -> ACK-FIN -> ACK"}
            ],
            "correctOptionId": "A",
            "explanation": "TCP uses a three-way handshake: Client sends SYN, Server replies with SYN-ACK, Client acknowledges with ACK.",
            "difficulty": "EASY"
        },

        # =====================================================================
        # CYBERSECURITY
        # =====================================================================
        {
            "section": "Cybersecurity",
            "topic": "Cryptography",
            "subtopic": "Asymmetric Encryption",
            "question": "In asymmetric public-key cryptography, which key is used to decrypt a message encrypted with the recipient's public key?",
            "options": [
                {"id": "A", "text": "Sender's public key"},
                {"id": "B", "text": "Sender's private key"},
                {"id": "C", "text": "Recipient's private key"},
                {"id": "D", "text": "Pre-shared symmetric secret key"}
            ],
            "correctOptionId": "C",
            "explanation": "Data encrypted with a public key can only be decrypted by the matching private key owned by the recipient.",
            "difficulty": "MEDIUM"
        },
        {
            "section": "Cybersecurity",
            "topic": "Network Attacks",
            "subtopic": "Man-in-the-Middle",
            "question": "Which attack involves an adversary poisoning ARP caches to intercept traffic between hosts on a LAN?",
            "options": [
                {"id": "A", "text": "DNS Amplification"},
                {"id": "B", "text": "ARP Spoofing"},
                {"id": "C", "text": "SQL Injection"},
                {"id": "D", "text": "Cross-Site Scripting"}
            ],
            "correctOptionId": "B",
            "explanation": "ARP Spoofing sends falsified ARP responses to link the attacker's MAC address with a legitimate default gateway IP.",
            "difficulty": "MEDIUM"
        },
        {
            "section": "Cybersecurity",
            "topic": "Authentication",
            "subtopic": "MFA Factors",
            "question": "A fingerprint or iris biometric scan represents which Multi-Factor Authentication (MFA) category?",
            "options": [
                {"id": "A", "text": "Something you know"},
                {"id": "B", "text": "Something you have"},
                {"id": "C", "text": "Somewhere you are"},
                {"id": "D", "text": "Something you are"}
            ],
            "correctOptionId": "D",
            "explanation": "Biometrics (fingerprints, facial recognition, iris scans) represent the 'Something you are' factor.",
            "difficulty": "EASY"
        },
        {
            "section": "Cybersecurity",
            "topic": "Firewalls",
            "subtopic": "Stateful Inspection",
            "question": "What capability differentiates a stateful firewall from a simple packet-filtering firewall?",
            "options": [
                {"id": "A", "text": "Ability to inspect physical cabling"},
                {"id": "B", "text": "Tracking the state and context of active TCP/UDP communication sessions"},
                {"id": "C", "text": "Decrypting end-to-end SSL certificates without keys"},
                {"id": "D", "text": "Blocking IP addresses based only on static port numbers"}
            ],
            "correctOptionId": "B",
            "explanation": "Stateful firewalls maintain a state table of ongoing connections to permit legitimate return traffic automatically.",
            "difficulty": "MEDIUM"
        },

        # =====================================================================
        # CLOUD COMPUTING
        # =====================================================================
        {
            "section": "Cloud",
            "topic": "Cloud Service Models",
            "subtopic": "Shared Responsibility",
            "question": "Under the Cloud Shared Responsibility Model for IaaS (Infrastructure as a Service), who is responsible for OS patching?",
            "options": [
                {"id": "A", "text": "The Cloud Service Provider alone"},
                {"id": "B", "text": "The Customer / Tenant alone"},
                {"id": "C", "text": "The Internet Service Provider"},
                {"id": "D", "text": "The Hardware Manufacturer"}
            ],
            "correctOptionId": "B",
            "explanation": "In IaaS, the cloud provider manages the physical data center, while the customer manages OS patching, runtimes, and apps.",
            "difficulty": "MEDIUM"
        },
        {
            "section": "Cloud",
            "topic": "Cloud Architecture",
            "subtopic": "Availability Zones",
            "question": "What is an Availability Zone (AZ) in enterprise cloud architecture?",
            "options": [
                {"id": "A", "text": "A global database replica"},
                {"id": "B", "text": "A software container image repository"},
                {"id": "C", "text": "One or more discrete physical data centers with redundant power, networking, and cooling within a Region"},
                {"id": "D", "text": "A DNS load balancer endpoint"}
            ],
            "correctOptionId": "C",
            "explanation": "Availability Zones are isolated physical data center locations within a cloud region connected by high-speed low-latency fibers.",
            "difficulty": "EASY"
        },
        {
            "section": "Cloud",
            "topic": "Cloud Economics",
            "subtopic": "Cost Management",
            "question": "What financial transition occurs when an enterprise migrates from on-premises hardware to public cloud services?",
            "options": [
                {"id": "A", "text": "Capital Expenditure (CapEx) transitions into Variable Operational Expenditure (OpEx)"},
                {"id": "B", "text": "Operational Expenditure is eliminated completely"},
                {"id": "C", "text": "Hardware depreciation cycles increase in duration"},
                {"id": "D", "text": "All software licensing fees become zero"}
            ],
            "correctOptionId": "A",
            "explanation": "Cloud computing moves heavy upfront capital investments (CapEx) into flexible, consumption-based operational expenses (OpEx).",
            "difficulty": "EASY"
        },

        # =====================================================================
        # PSEUDOCODE
        # =====================================================================
        {
            "section": "Pseudocode",
            "topic": "Bitwise Operations",
            "subtopic": "XOR and Shift",
            "question": "What will be the output of the following pseudocode?\nInteger a, b, c\nSet a = 5, b = 3\nc = (a ^ b) << 1\nPrint c",
            "options": [
                {"id": "A", "text": "8"},
                {"id": "B", "text": "12"},
                {"id": "C", "text": "16"},
                {"id": "D", "text": "6"}
            ],
            "correctOptionId": "B",
            "explanation": "5 = 0101 in binary, 3 = 0011. 5 ^ 3 = 0110 (6). 6 << 1 shifts left by 1 bit, multiplying by 2 to yield 12.",
            "difficulty": "EASY"
        },
        {
            "section": "Pseudocode",
            "topic": "Loops & Accumulators",
            "subtopic": "Conditionals",
            "question": "What will be the value of sum after executing the pseudocode?\nInteger sum, i\nSet sum = 0\nFor i = 1 to 5\n  If (i mod 2 != 0)\n    sum = sum + i\n  End If\nEnd For\nPrint sum",
            "options": [
                {"id": "A", "text": "6"},
                {"id": "B", "text": "15"},
                {"id": "C", "text": "9"},
                {"id": "D", "text": "12"}
            ],
            "correctOptionId": "C",
            "explanation": "Odd values in 1 to 5 are 1, 3, and 5. sum = 1 + 3 + 5 = 9.",
            "difficulty": "EASY"
        },
        {
            "section": "Pseudocode",
            "topic": "Recursion",
            "subtopic": "Base Case Termination",
            "question": "What is the return value of solve(3)?\nInteger solve(Integer n)\n  If (n <= 1)\n    return 1\n  End If\n  return n * solve(n - 1)\nEnd function solve()",
            "options": [
                {"id": "A", "text": "3"},
                {"id": "B", "text": "6"},
                {"id": "C", "text": "9"},
                {"id": "D", "text": "1"}
            ],
            "correctOptionId": "B",
            "explanation": "solve(3) returns 3 * solve(2) = 3 * (2 * solve(1)) = 3 * 2 * 1 = 6 (standard factorial algorithm).",
            "difficulty": "EASY"
        },

        # =====================================================================
        # COMPUTER FUNDAMENTALS & OS
        # =====================================================================
        {
            "section": "Computer Fundamentals",
            "topic": "Operating Systems",
            "subtopic": "Deadlock Conditions",
            "question": "Which of the following is NOT one of the four Coffman conditions necessary for a system deadlock to occur?",
            "options": [
                {"id": "A", "text": "Mutual Exclusion"},
                {"id": "B", "text": "Hold and Wait"},
                {"id": "C", "text": "Preemption Allowed"},
                {"id": "D", "text": "Circular Wait"}
            ],
            "correctOptionId": "C",
            "explanation": "The four Coffman conditions are: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Preemption breaks deadlocks.",
            "difficulty": "MEDIUM"
        },
        {
            "section": "Computer Fundamentals",
            "topic": "Memory Management",
            "subtopic": "Thrashing",
            "question": "In operating systems, what causes 'Thrashing'?",
            "options": [
                {"id": "A", "text": "A corrupt master boot record"},
                {"id": "B", "text": "Excessive page faulting causing the CPU to spend more time swapping pages than executing instructions"},
                {"id": "C", "text": "Deadlock between two CPU cores"},
                {"id": "D", "text": "Cache memory becoming full"}
            ],
            "correctOptionId": "B",
            "explanation": "Thrashing occurs when total memory allocated to active processes exceeds physical RAM, causing continuous disk-paging overhead.",
            "difficulty": "MEDIUM"
        },

        # =====================================================================
        # DBMS & SQL
        # =====================================================================
        {
            "section": "DBMS",
            "topic": "Transactions",
            "subtopic": "ACID Properties",
            "question": "Which ACID property guarantees that all operations within a transaction complete successfully, or all are rolled back?",
            "options": [
                {"id": "A", "text": "Atomicity"},
                {"id": "B", "text": "Consistency"},
                {"id": "C", "text": "Isolation"},
                {"id": "D", "text": "Durability"}
            ],
            "correctOptionId": "A",
            "explanation": "Atomicity (all-or-nothing) ensures that either the entire transaction takes effect or none of it does.",
            "difficulty": "EASY"
        },
        {
            "section": "DBMS",
            "topic": "SQL Queries",
            "subtopic": "Aggregations",
            "question": "Which SQL clause is used to filter groups created by a GROUP BY query based on an aggregate condition?",
            "options": [
                {"id": "A", "text": "WHERE"},
                {"id": "B", "text": "ORDER BY"},
                {"id": "C", "text": "HAVING"},
                {"id": "D", "text": "LIMIT"}
            ],
            "correctOptionId": "C",
            "explanation": "HAVING filters grouped records based on aggregate values (e.g., HAVING COUNT(*) > 5), whereas WHERE filters individual rows before grouping.",
            "difficulty": "EASY"
        },

        # =====================================================================
        # JAVA & OOP
        # =====================================================================
        {
            "section": "Java",
            "topic": "Object Oriented Programming",
            "subtopic": "Polymorphism",
            "question": "Which feature in Java demonstrates compile-time (static) polymorphism?",
            "options": [
                {"id": "A", "text": "Method Overriding"},
                {"id": "B", "text": "Method Overloading"},
                {"id": "C", "text": "Dynamic Method Dispatch"},
                {"id": "D", "text": "Interface Implementation"}
            ],
            "correctOptionId": "B",
            "explanation": "Method Overloading resolves method signatures at compile time based on parameter types and counts.",
            "difficulty": "EASY"
        },
        {
            "section": "Java",
            "topic": "Java Core",
            "subtopic": "String Immutability",
            "question": "Why are String objects designed to be immutable in Java?",
            "options": [
                {"id": "A", "text": "To increase memory consumption"},
                {"id": "B", "text": "To prevent them from being stored in the Heap"},
                {"id": "C", "text": "For security, caching in the String Constant Pool, and thread safety"},
                {"id": "D", "text": "Because Java does not support garbage collection on strings"}
            ],
            "correctOptionId": "C",
            "explanation": "String immutability permits safe sharing in the String Constant Pool, ensures thread safety, and protects sensitive parameters.",
            "difficulty": "MEDIUM"
        },

        # =====================================================================
        # DEVOPS
        # =====================================================================
        {
            "section": "DevOps",
            "topic": "Git & Version Control",
            "subtopic": "Branch Management",
            "question": "In Git, which command integrates changes from one branch into another by creating a new merge commit?",
            "options": [
                {"id": "A", "text": "git rebase"},
                {"id": "B", "text": "git checkout"},
                {"id": "C", "text": "git merge --no-ff"},
                {"id": "D", "text": "git cherry-pick"}
            ],
            "correctOptionId": "C",
            "explanation": "git merge --no-ff forces Git to create a merge commit even if a fast-forward merge was possible, preserving branch history.",
            "difficulty": "MEDIUM"
        },
        {
            "section": "DevOps",
            "topic": "Continuous Integration",
            "subtopic": "Pipeline Principles",
            "question": "What is the primary objective of Continuous Integration (CI)?",
            "options": [
                {"id": "A", "text": "To automate production database backups once a month"},
                {"id": "B", "text": "To frequently merge developer working copies to a shared mainline and run automated builds and tests"},
                {"id": "C", "text": "To deploy software to production without any automated testing"},
                {"id": "D", "text": "To convert monolith applications into microservices automatically"}
            ],
            "correctOptionId": "B",
            "explanation": "CI ensures developers integrate code frequently into a shared repository, triggering automated builds and unit tests to catch defects early.",
            "difficulty": "EASY"
        },

        # =====================================================================
        # COMMUNICATION / ENGLISH
        # =====================================================================
        {
            "section": "Communication",
            "topic": "Grammar & Sentence Completion",
            "subtopic": "Subject-Verb Agreement",
            "question": "Choose the grammatically correct option to complete the sentence: 'Neither the manager nor the team members ________ prepared for the surprise audit.'",
            "options": [
                {"id": "A", "text": "was"},
                {"id": "B", "text": "were"},
                {"id": "C", "text": "is"},
                {"id": "D", "text": "has been"}
            ],
            "correctOptionId": "B",
            "explanation": "In 'Neither... nor' constructions with compound subjects, the verb agrees with the closer subject ('team members', which is plural: 'were').",
            "difficulty": "MEDIUM"
        },
        {
            "section": "Communication",
            "topic": "Professional Vocabulary",
            "subtopic": "Contextual Idioms",
            "question": "In corporate communication, what does the phrase 'to touch base' mean?",
            "options": [
                {"id": "A", "text": "To resign from a position"},
                {"id": "B", "text": "To brief or update someone briefly on progress"},
                {"id": "C", "text": "To terminate a business contract"},
                {"id": "D", "text": "To submit an official audit report"}
            ],
            "correctOptionId": "B",
            "explanation": "'To touch base' is an idiomatic corporate expression meaning to briefly make contact or update someone on a situation.",
            "difficulty": "EASY"
        }
    ]
    data.extend([
        {'section': 'MS Office', 'topic': 'Excel', 'subtopic': 'Pivot Tables', 'question': 'Which component of an Excel PivotTable should a field be dragged into to display aggregated mathematical calculations (e.g. Total Revenue)?', 'options': [{'id': 'A', 'text': 'Rows area'}, {'id': 'B', 'text': 'Columns area'}, {'id': 'C', 'text': 'Values area'}, {'id': 'D', 'text': 'Filters area'}], 'correctOptionId': 'C', 'explanation': 'The Values area calculates summaries such as Sum, Count, Average, Min, and Max from the underlying records.', 'difficulty': 'EASY'},
        {'section': 'MS Office', 'topic': 'Excel', 'subtopic': 'Data Validation & Tools', 'question': "Which keyboard shortcut in Microsoft Excel instantly opens the 'Create Table' dialog box for the selected dataset?", 'options': [{'id': 'A', 'text': 'Ctrl + T'}, {'id': 'B', 'text': 'Ctrl + Alt + T'}, {'id': 'C', 'text': 'Alt + F1'}, {'id': 'D', 'text': 'Shift + F11'}], 'correctOptionId': 'A', 'explanation': 'Ctrl + T (or Ctrl + L) immediately converts an active range into a formatted Excel Table.', 'difficulty': 'EASY'},
        {'section': 'MS Office', 'topic': 'Word', 'subtopic': 'Tracking & Collaboration', 'question': "In Microsoft Word, what happens when 'Track Changes' is enabled?", 'options': [{'id': 'A', 'text': 'The document is locked against all edits'}, {'id': 'B', 'text': 'All insertions, deletions, and formatting modifications are highlighted and logged with author metadata'}, {'id': 'C', 'text': 'The file is uploaded automatically to OneDrive'}, {'id': 'D', 'text': 'Spelling mistakes are automatically deleted'}], 'correctOptionId': 'B', 'explanation': 'Track Changes logs every editorial alteration, displaying strikethroughs, insertions, and timestamps for collaborative review.', 'difficulty': 'EASY'},
        {'section': 'MS Office', 'topic': 'Outlook', 'subtopic': 'Rule Management', 'question': 'Which feature in Microsoft Outlook automatically moves incoming emails matching specific keywords into designated folders?', 'options': [{'id': 'A', 'text': 'AutoArchive'}, {'id': 'B', 'text': 'Quick Steps'}, {'id': 'C', 'text': 'Rules and Alerts'}, {'id': 'D', 'text': 'Mail Merge'}], 'correctOptionId': 'C', 'explanation': 'Outlook Rules automate email processing based on sender, subject words, or recipient conditions upon arrival.', 'difficulty': 'EASY'},
        {'section': 'Networking', 'topic': 'VLANs', 'subtopic': 'IEEE Standards', 'question': 'Which IEEE standard governs VLAN tagging on Ethernet frames across trunk links?', 'options': [{'id': 'A', 'text': 'IEEE 802.11'}, {'id': 'B', 'text': 'IEEE 802.1Q'}, {'id': 'C', 'text': 'IEEE 802.3'}, {'id': 'D', 'text': 'IEEE 802.1X'}], 'correctOptionId': 'B', 'explanation': 'IEEE 802.1Q inserts a 4-byte VLAN tag into Ethernet frames to preserve virtual network separation across trunk switches.', 'difficulty': 'MEDIUM'},
        {'section': 'Networking', 'topic': 'DNS', 'subtopic': 'Record Types', 'question': 'Which DNS resource record specifies the mail exchange server responsible for accepting incoming emails for a domain?', 'options': [{'id': 'A', 'text': 'A Record'}, {'id': 'B', 'text': 'CNAME Record'}, {'id': 'C', 'text': 'TXT Record'}, {'id': 'D', 'text': 'MX Record'}], 'correctOptionId': 'D', 'explanation': 'MX (Mail Exchange) records route emails directed to a domain to the appropriate mail host servers.', 'difficulty': 'EASY'},
        {'section': 'Networking', 'topic': 'Network Security Devices', 'subtopic': 'IDS vs IPS', 'question': 'What is the key functional difference between an Intrusion Detection System (IDS) and an Intrusion Prevention System (IPS)?', 'options': [{'id': 'A', 'text': 'An IDS drops malicious packets inline, whereas an IPS only alerts administrators'}, {'id': 'B', 'text': 'An IDS operates out-of-band to alert on anomalies, while an IPS sits inline and actively blocks detected threats'}, {'id': 'C', 'text': 'An IDS only protects wireless networks, while an IPS is exclusively wired'}, {'id': 'D', 'text': 'An IDS decrypts SSL/TLS, whereas an IPS cannot inspect encrypted packets'}], 'correctOptionId': 'B', 'explanation': 'IDS detects and generates alerts passively out-of-band, while IPS is situated inline to actively terminate attack connections.', 'difficulty': 'MEDIUM'},
        {'section': 'Cybersecurity', 'topic': 'Password Security', 'subtopic': 'Salting', 'question': "Why is a cryptographic 'salt' appended to user passwords before hashing?", 'options': [{'id': 'A', 'text': 'To compress the password into a shorter bit sequence'}, {'id': 'B', 'text': 'To foil precomputed dictionary and Rainbow Table attacks by ensuring identical passwords have unique hash outputs'}, {'id': 'C', 'text': 'To allow the system administrator to reverse-engineer forgotten passwords'}, {'id': 'D', 'text': 'To convert the hash into symmetric ciphertext'}], 'correctOptionId': 'B', 'explanation': 'Salting adds unique random strings to plaintext passwords before hashing, rendering precomputed rainbow tables useless.', 'difficulty': 'MEDIUM'},
        {'section': 'Cybersecurity', 'topic': 'Web Application Vulnerabilities', 'subtopic': 'Cross-Site Scripting (XSS)', 'question': 'What occurs during a Stored (Persistent) Cross-Site Scripting (XSS) attack?', 'options': [{'id': 'A', 'text': 'Malicious payload is permanently saved in the application database and executed in the browser of any user viewing the affected page'}, {'id': 'B', 'text': 'The attacker floods the web server with SYN packets'}, {'id': 'C', 'text': 'Database tables are dropped via unsanitized SQL commands'}, {'id': 'D', 'text': "The web server's private SSL key is extracted from memory"}], 'correctOptionId': 'A', 'explanation': 'Stored XSS embeds malicious JavaScript permanently into persistent storage (e.g. comment feed), triggering on victim visits.', 'difficulty': 'MEDIUM'},
        {'section': 'Cybersecurity', 'topic': 'Security Architecture', 'subtopic': 'Zero Trust', 'question': "What is the foundational principle of a 'Zero Trust' network architecture?", 'options': [{'id': 'A', 'text': 'Trust all internal network traffic behind the perimeter firewall'}, {'id': 'B', 'text': 'Never trust, always verify every access request regardless of origin'}, {'id': 'C', 'text': 'Eliminate multi-factor authentication for corporate devices'}, {'id': 'D', 'text': 'Encrypt only outbound public traffic'}], 'correctOptionId': 'B', 'explanation': "Zero Trust operates on 'never trust, always verify'—requiring continuous authentication, authorization, and microsegmentation.", 'difficulty': 'EASY'},
        {'section': 'Cloud', 'topic': 'Serverless', 'subtopic': 'FaaS Architecture', 'question': 'Which core operational benefit defines Serverless Computing (Function-as-a-Service, e.g. AWS Lambda)?', 'options': [{'id': 'A', 'text': 'Dedicated physical servers assigned 24/7 to the tenant'}, {'id': 'B', 'text': 'Automatic scaling with event-driven execution and zero cost when code is idle'}, {'id': 'C', 'text': 'Manual operating system patch scheduling required every weekend'}, {'id': 'D', 'text': 'Unlimited continuous execution time without timeouts'}], 'correctOptionId': 'B', 'explanation': 'Serverless architectures scale automatically from zero to thousands of parallel requests and charge only during active compute runs.', 'difficulty': 'EASY'},
        {'section': 'Cloud', 'topic': 'Object Storage', 'subtopic': 'Storage Tiers', 'question': 'Which cloud storage class is specifically optimized for long-term data archiving with retrieval times measured in hours at minimum cost?', 'options': [{'id': 'A', 'text': 'Standard Multi-Region Storage'}, {'id': 'B', 'text': 'Coldline / Glacier Deep Archive'}, {'id': 'C', 'text': 'Solid-State Drive Block Storage'}, {'id': 'D', 'text': 'In-Memory Caching Cluster'}], 'correctOptionId': 'B', 'explanation': 'Glacier Deep Archive provides ultra-low cost storage for compliance/backup records accessed infrequently with multi-hour retrieval.', 'difficulty': 'EASY'},
        {'section': 'Cloud', 'topic': 'Virtualization', 'subtopic': 'Hypervisors', 'question': 'What characterizes a Type-1 (Bare-Metal) Hypervisor compared to a Type-2 (Hosted) Hypervisor?', 'options': [{'id': 'A', 'text': 'It executes directly on the physical host hardware without an underlying host operating system'}, {'id': 'B', 'text': 'It runs as an application on top of Windows or Linux'}, {'id': 'C', 'text': 'It only supports containerization, not virtual machines'}, {'id': 'D', 'text': 'It has lower throughput and higher latency than hosted software'}], 'correctOptionId': 'A', 'explanation': 'Type-1 hypervisors (e.g. VMware ESXi, KVM) run directly on bare metal hardware, providing superior enterprise performance.', 'difficulty': 'MEDIUM'},
        {'section': 'Pseudocode', 'topic': 'Bitwise Operations', 'subtopic': 'AND Masking', 'question': 'What is the output of the following pseudocode?\nInteger a, b, c\nSet a = 14, b = 7\nc = a & b\nPrint c', 'options': [{'id': 'A', 'text': '6'}, {'id': 'B', 'text': '14'}, {'id': 'C', 'text': '7'}, {'id': 'D', 'text': '0'}], 'correctOptionId': 'A', 'explanation': '14 = 1110 in binary, 7 = 0111. 1110 & 0111 = 0110 in binary, which is decimal 6.', 'difficulty': 'EASY'},
        {'section': 'Pseudocode', 'topic': 'Nested Loops', 'subtopic': 'Execution Count', 'question': "How many times will 'Accenture' be printed?\nInteger i, j\nFor i = 1 to 3\n  For j = 1 to i\n    Print 'Accenture'\n  End For\nEnd For", 'options': [{'id': 'A', 'text': '9 times'}, {'id': 'B', 'text': '6 times'}, {'id': 'C', 'text': '3 times'}, {'id': 'D', 'text': '12 times'}], 'correctOptionId': 'B', 'explanation': 'When i=1: j runs 1 time. When i=2: j runs 2 times. When i=3: j runs 3 times. Total = 1 + 2 + 3 = 6 times.', 'difficulty': 'EASY'},
        {'section': 'Pseudocode', 'topic': 'Array Manipulation', 'subtopic': 'Pointer Arithmetic', 'question': 'What is printed by this pseudocode?\nInteger arr[4] = {10, 20, 30, 40}\nInteger res = arr[0] + arr[3] - arr[1]\nPrint res', 'options': [{'id': 'A', 'text': '20'}, {'id': 'B', 'text': '40'}, {'id': 'C', 'text': '30'}, {'id': 'D', 'text': '50'}], 'correctOptionId': 'C', 'explanation': 'arr[0] is 10, arr[3] is 40, arr[1] is 20. Calculation: 10 + 40 - 20 = 30.', 'difficulty': 'EASY'},
        {'section': 'Computer Fundamentals', 'topic': 'Process Scheduling', 'subtopic': 'Round Robin', 'question': 'What key metric determines process time-slice duration in Round Robin CPU scheduling?', 'options': [{'id': 'A', 'text': 'Priority weight'}, {'id': 'B', 'text': 'Time Quantum'}, {'id': 'C', 'text': 'Burst duration limit'}, {'id': 'D', 'text': 'I/O wait threshold'}], 'correctOptionId': 'B', 'explanation': 'In Round Robin scheduling, the CPU is assigned to each ready process in cyclic order for a fixed unit of time called the Time Quantum.', 'difficulty': 'EASY'},
        {'section': 'Computer Fundamentals', 'topic': 'Synchronization', 'subtopic': 'Mutual Exclusion', 'question': 'What is the primary difference between a Mutex and a Counting Semaphore?', 'options': [{'id': 'A', 'text': 'A Mutex is a locking mechanism allowing only one thread access at a time, whereas a Counting Semaphore allows up to N concurrent threads'}, {'id': 'B', 'text': 'A Mutex runs in user space, while a Semaphore runs only in GPU registers'}, {'id': 'C', 'text': 'A Semaphore can never cause deadlocks'}, {'id': 'D', 'text': 'A Mutex cannot be unlocked by the thread that locked it'}], 'correctOptionId': 'A', 'explanation': 'A Mutex has ownership and restricts access to a single thread (binary 0/1), while a counting semaphore tracks N available resources.', 'difficulty': 'MEDIUM'},
        {'section': 'DBMS', 'topic': 'Normalization', 'subtopic': 'Third Normal Form', 'question': 'To satisfy Third Normal Form (3NF), what must a relation satisfy in addition to being in 2NF?', 'options': [{'id': 'A', 'text': 'Contain no repeating groups or multivalued attributes'}, {'id': 'B', 'text': 'Have no transitive functional dependencies for non-prime attributes'}, {'id': 'C', 'text': 'Ensure every determinant is a superkey'}, {'id': 'D', 'text': 'Contain at least three foreign keys'}], 'correctOptionId': 'B', 'explanation': '3NF requires a table to be in 2NF and have no transitive dependencies (no non-prime attribute depending on another non-prime attribute).', 'difficulty': 'MEDIUM'},
        {'section': 'DBMS', 'topic': 'Indexing', 'subtopic': 'Clustered Indexes', 'question': 'How many Clustered Indexes can exist on a single relational database table?', 'options': [{'id': 'A', 'text': 'Exactly one, because it physically reorders the actual data rows on disk'}, {'id': 'B', 'text': 'Up to 16 clustered indexes'}, {'id': 'C', 'text': 'An unlimited number'}, {'id': 'D', 'text': 'Zero, clustered indexes only exist on views'}], 'correctOptionId': 'A', 'explanation': 'A table can have only one clustered index because the data rows themselves can be physically sorted in only one order on disk.', 'difficulty': 'EASY'},
        {'section': 'Java', 'topic': 'Exception Handling', 'subtopic': 'Checked vs Unchecked', 'question': 'Which of the following exceptions is an Unchecked Exception (subclass of RuntimeException) in Java?', 'options': [{'id': 'A', 'text': 'IOException'}, {'id': 'B', 'text': 'SQLException'}, {'id': 'C', 'text': 'NullPointerException'}, {'id': 'D', 'text': 'ClassNotFoundException'}], 'correctOptionId': 'C', 'explanation': 'NullPointerException extends RuntimeException, making it an unchecked exception that does not require mandatory try-catch or throws.', 'difficulty': 'EASY'},
        {'section': 'Java', 'topic': 'Collections Framework', 'subtopic': 'HashMap Internals', 'question': 'What is the average time complexity for get() and put() operations in a well-distributed Java HashMap?', 'options': [{'id': 'A', 'text': 'O(log N)'}, {'id': 'B', 'text': 'O(1)'}, {'id': 'C', 'text': 'O(N)'}, {'id': 'D', 'text': 'O(N log N)'}], 'correctOptionId': 'B', 'explanation': 'HashMaps compute bucket index via hashCode(), achieving O(1) constant time average performance for lookup and insertion.', 'difficulty': 'EASY'},
        {'section': 'DevOps', 'topic': 'Containers', 'subtopic': 'Docker Architecture', 'question': 'What is the key structural difference between a Docker container and a traditional Virtual Machine?', 'options': [{'id': 'A', 'text': 'Containers share the host operating system kernel, whereas VMs run a complete guest OS on top of a hypervisor'}, {'id': 'B', 'text': 'VMs startup in milliseconds, while containers take several minutes'}, {'id': 'C', 'text': 'Containers require their own dedicated hypervisor hardware'}, {'id': 'D', 'text': 'Docker cannot run on Linux systems'}], 'correctOptionId': 'A', 'explanation': 'Containers share the host OS kernel and isolate user spaces via cgroups/namespaces, making them much lighter than full guest VMs.', 'difficulty': 'EASY'},
        {'section': 'DevOps', 'topic': 'Kubernetes', 'subtopic': 'Core Abstractions', 'question': 'What is the smallest deployable computing unit that can be created and managed in Kubernetes?', 'options': [{'id': 'A', 'text': 'Service'}, {'id': 'B', 'text': 'Node'}, {'id': 'C', 'text': 'Pod'}, {'id': 'D', 'text': 'Deployment'}], 'correctOptionId': 'C', 'explanation': 'A Pod encapsulates one or more containers, storage resources, and unique network IP in Kubernetes cluster orchestration.', 'difficulty': 'EASY'},
        {'section': 'Communication', 'topic': 'Grammar', 'subtopic': 'Prepositions', 'question': "Identify the correct preposition: 'The team must strictly abide ________ corporate security regulations.'", 'options': [{'id': 'A', 'text': 'to'}, {'id': 'B', 'text': 'by'}, {'id': 'C', 'text': 'with'}, {'id': 'D', 'text': 'for'}], 'correctOptionId': 'B', 'explanation': "The phrasal verb 'abide by' means to accept or obey a rule, decision, or recommendation.", 'difficulty': 'EASY'},
        {'section': 'Communication', 'topic': 'Grammar', 'subtopic': 'Conditionals', 'question': "Complete the third conditional sentence correctly: 'If the database administrator ________ the patch earlier, the system crash would not have occurred.'", 'options': [{'id': 'A', 'text': 'applied'}, {'id': 'B', 'text': 'applies'}, {'id': 'C', 'text': 'had applied'}, {'id': 'D', 'text': 'has applied'}], 'correctOptionId': 'C', 'explanation': 'Third conditional structures follow: If + past perfect (had applied), ... would have + past participle.', 'difficulty': 'MEDIUM'},
    ])
    data.extend([
        {'section': 'MS Office', 'topic': 'Excel', 'subtopic': 'Text Functions', 'question': 'Which Excel formula extracts the first 5 characters from text stored in cell A2?', 'options': [{'id': 'A', 'text': '=MID(A2, 5)'}, {'id': 'B', 'text': '=FIRST(A2, 5)'}, {'id': 'C', 'text': '=LEFT(A2, 5)'}, {'id': 'D', 'text': '=SUBSTRING(A2, 1, 5)'}], 'correctOptionId': 'C', 'explanation': '=LEFT(text, [num_chars]) extracts the specified number of characters starting from the far left of a text string.', 'difficulty': 'EASY'},
        {'section': 'MS Office', 'topic': 'Excel', 'subtopic': 'Cell Referencing', 'question': "What kind of cell reference is represented by '$C$10' in an Excel formula?", 'options': [{'id': 'A', 'text': 'Relative Reference'}, {'id': 'B', 'text': 'Absolute Reference'}, {'id': 'C', 'text': 'Mixed Reference with locked row only'}, {'id': 'D', 'text': 'Circular Reference'}], 'correctOptionId': 'B', 'explanation': 'Placing a dollar sign before both the column letter and row number ($C$10) creates an absolute reference that does not change when copied.', 'difficulty': 'EASY'},
        {'section': 'MS Office', 'topic': 'Word', 'subtopic': 'Document Views', 'question': 'Which view in Microsoft Word displays the document exactly as it will look when printed on physical paper?', 'options': [{'id': 'A', 'text': 'Draft View'}, {'id': 'B', 'text': 'Web Layout View'}, {'id': 'C', 'text': 'Outline View'}, {'id': 'D', 'text': 'Print Layout View'}], 'correctOptionId': 'D', 'explanation': 'Print Layout View shows margins, page breaks, headers, and footers exactly as they will appear when printed.', 'difficulty': 'EASY'},
        {'section': 'MS Office', 'topic': 'PowerPoint', 'subtopic': 'Animations & Transitions', 'question': 'In PowerPoint, what is the key difference between an Animation and a Transition?', 'options': [{'id': 'A', 'text': 'Transitions apply to individual objects on a slide, while Animations apply to entire slides'}, {'id': 'B', 'text': 'Transitions apply to how a slide enters or exits the screen, while Animations apply to individual text or objects within a slide'}, {'id': 'C', 'text': 'Animations only work on video files, while Transitions only work on shapes'}, {'id': 'D', 'text': 'There is no difference; they are interchangeable terms'}], 'correctOptionId': 'B', 'explanation': 'Slide Transitions control movement between slides, whereas Animations apply motion effects to specific elements on a slide.', 'difficulty': 'EASY'},
        {'section': 'MS Office', 'topic': 'Excel', 'subtopic': 'Flash Fill', 'question': 'Which Excel shortcut automatically senses patterns in adjacent columns and populates data using Flash Fill?', 'options': [{'id': 'A', 'text': 'Ctrl + E'}, {'id': 'B', 'text': 'Ctrl + D'}, {'id': 'C', 'text': 'Ctrl + R'}, {'id': 'D', 'text': 'Ctrl + F'}], 'correctOptionId': 'A', 'explanation': 'Ctrl + E invokes Flash Fill in Excel, recognizing text patterns (e.g. splitting first and last names) and completing the column automatically.', 'difficulty': 'EASY'},
        {'section': 'Networking', 'topic': 'Switching', 'subtopic': 'Spanning Tree Protocol', 'question': 'What catastrophic network loop condition is prevented by the Spanning Tree Protocol (STP, IEEE 802.1D)?', 'options': [{'id': 'A', 'text': 'SYN Flood'}, {'id': 'B', 'text': 'Broadcast Storm'}, {'id': 'C', 'text': 'IP address exhaustion'}, {'id': 'D', 'text': 'Buffer Overflow'}], 'correctOptionId': 'B', 'explanation': 'STP prevents bridging loops and resulting broadcast storms by selectively blocking redundant switch ports.', 'difficulty': 'MEDIUM'},
        {'section': 'Networking', 'topic': 'IP Addressing', 'subtopic': 'Private IP Ranges', 'question': 'According to RFC 1918, which of the following represents a private IPv4 address block?', 'options': [{'id': 'A', 'text': '172.16.0.0 to 172.31.255.255'}, {'id': 'B', 'text': '11.0.0.0 to 11.255.255.255'}, {'id': 'C', 'text': '192.169.0.0 to 192.169.255.255'}, {'id': 'D', 'text': '169.255.0.0 to 169.255.255.255'}], 'correctOptionId': 'A', 'explanation': 'RFC 1918 defines private address spaces: 10.0.0.0/8, 172.16.0.0/12 (up to 172.31.255.255), and 192.168.0.0/16.', 'difficulty': 'MEDIUM'},
        {'section': 'Networking', 'topic': 'Network Layer', 'subtopic': 'ICMP', 'question': "Which protocol is utilized by network diagnostic tools like 'ping' and 'traceroute' to report errors and connectivity status?", 'options': [{'id': 'A', 'text': 'IGMP'}, {'id': 'B', 'text': 'SNMP'}, {'id': 'C', 'text': 'ICMP'}, {'id': 'D', 'text': 'SMTP'}], 'correctOptionId': 'C', 'explanation': 'ICMP (Internet Control Message Protocol) generates error reporting and operational queries like Echo Request and Echo Reply.', 'difficulty': 'EASY'},
        {'section': 'Networking', 'topic': 'Application Layer Protocols', 'subtopic': 'SSH', 'question': 'What is the standard default TCP port allocated for Secure Shell (SSH) remote administrative access?', 'options': [{'id': 'A', 'text': 'Port 21'}, {'id': 'B', 'text': 'Port 22'}, {'id': 'C', 'text': 'Port 23'}, {'id': 'D', 'text': 'Port 25'}], 'correctOptionId': 'B', 'explanation': 'TCP port 22 is the IANA standard port reserved for encrypted SSH secure logins and SCP/SFTP transfers.', 'difficulty': 'EASY'},
        {'section': 'Networking', 'topic': 'Network Architecture', 'subtopic': 'NAT', 'question': 'Which Network Address Translation (NAT) variation maps multiple private IP addresses to a single public IP address using unique port numbers?', 'options': [{'id': 'A', 'text': 'Static NAT'}, {'id': 'B', 'text': 'Dynamic NAT'}, {'id': 'C', 'text': 'Port Address Translation (PAT) / NAT Overload'}, {'id': 'D', 'text': 'Direct Routing NAT'}], 'correctOptionId': 'C', 'explanation': 'PAT (Port Address Translation), also known as NAT Overload, assigns distinct source port numbers to distinguish concurrent outbound sessions on a single IP.', 'difficulty': 'MEDIUM'},
        {'section': 'Cybersecurity', 'topic': 'Malware Analysis', 'subtopic': 'Ransomware', 'question': 'Which form of malicious software encrypts victim files and demands payment in cryptocurrency in exchange for the decryption key?', 'options': [{'id': 'A', 'text': 'Spyware'}, {'id': 'B', 'text': 'Rootkit'}, {'id': 'C', 'text': 'Adware'}, {'id': 'D', 'text': 'Ransomware'}], 'correctOptionId': 'D', 'explanation': 'Ransomware utilizes asymmetric/symmetric encryption to hold data hostage until extortion demands are satisfied.', 'difficulty': 'EASY'},
        {'section': 'Cybersecurity', 'topic': 'Web Security', 'subtopic': 'SQL Injection', 'question': 'What is the most effective programmatic defense against SQL Injection vulnerabilities in backend databases?', 'options': [{'id': 'A', 'text': 'Client-side form field length validation'}, {'id': 'B', 'text': 'Parameterized queries (Prepared Statements) with bound variables'}, {'id': 'C', 'text': 'Storing database credentials in plain text'}, {'id': 'D', 'text': 'Disabling database indexes'}], 'correctOptionId': 'B', 'explanation': 'Prepared Statements treat user inputs strictly as literal data parameters rather than executable SQL code, neutralizing SQL injection.', 'difficulty': 'EASY'},
        {'section': 'Cybersecurity', 'topic': 'Cryptography', 'subtopic': 'Hashing Algorithms', 'question': 'Which of the following is a secure cryptographic hash function that produces a 256-bit fixed digest?', 'options': [{'id': 'A', 'text': 'MD5'}, {'id': 'B', 'text': 'SHA-1'}, {'id': 'C', 'text': 'SHA-256'}, {'id': 'D', 'text': 'RC4'}], 'correctOptionId': 'C', 'explanation': 'SHA-256 (part of the SHA-2 family) outputs a 256-bit digest and remains computationally collision-resistant, unlike MD5 and SHA-1.', 'difficulty': 'EASY'},
        {'section': 'Cybersecurity', 'topic': 'Web Security', 'subtopic': 'CSRF Defense', 'question': 'How does an Anti-CSRF (Cross-Site Request Forgery) token defend web applications?', 'options': [{'id': 'A', 'text': 'By compressing cookies sent in HTTP requests'}, {'id': 'B', 'text': 'By supplying a unique, secret, unpredictable token validated by the server with every state-changing request'}, {'id': 'C', 'text': "By disabling JavaScript in the victim's browser"}, {'id': 'D', 'text': 'By enforcing complex password renewal policies'}], 'correctOptionId': 'B', 'explanation': 'Anti-CSRF tokens cannot be guessed or read by unauthorized third-party origins, preventing forged cross-site POST/PUT commands.', 'difficulty': 'MEDIUM'},
        {'section': 'Cybersecurity', 'topic': 'Social Engineering', 'subtopic': 'Phishing', 'question': 'What term describes a targeted phishing attack directed specifically at senior corporate executives (e.g. CEO, CFO)?', 'options': [{'id': 'A', 'text': 'Spear Phishing'}, {'id': 'B', 'text': 'Whaling'}, {'id': 'C', 'text': 'Vishing'}, {'id': 'D', 'text': 'Smishing'}], 'correctOptionId': 'B', 'explanation': 'Whaling is a highly customized social engineering attack specifically targeting high-profile corporate leaders to steal funds or executive credentials.', 'difficulty': 'EASY'},
        {'section': 'Cloud', 'topic': 'Cloud Elasticity', 'subtopic': 'Scalability', 'question': 'What is the architectural distinction between Vertical Scaling (Scale-Up) and Horizontal Scaling (Scale-Out)?', 'options': [{'id': 'A', 'text': 'Vertical scaling adds more compute instances, while horizontal scaling adds more RAM to an existing single instance'}, {'id': 'B', 'text': 'Vertical scaling increases CPU/RAM on a single server, while horizontal scaling adds more servers to share workload'}, {'id': 'C', 'text': 'Vertical scaling is only used in serverless architectures'}, {'id': 'D', 'text': 'Horizontal scaling requires shutting down all database services'}], 'correctOptionId': 'B', 'explanation': 'Scale-up increases capacity of a single node; scale-out distributes traffic across an array of coordinated commodity instances.', 'difficulty': 'EASY'},
        {'section': 'Cloud', 'topic': 'Virtual Private Cloud', 'subtopic': 'Subnet Routing', 'question': 'What component must be attached to a VPC subnet route table to permit direct bidirectional access to the public Internet?', 'options': [{'id': 'A', 'text': 'Internet Gateway (IGW)'}, {'id': 'B', 'text': 'VPC Endpoint'}, {'id': 'C', 'text': 'Virtual Private Gateway (VGW)'}, {'id': 'D', 'text': 'Direct Connect Link'}], 'correctOptionId': 'A', 'explanation': 'An Internet Gateway (IGW) enables communication between VPC instances and the open Internet via 0.0.0.0/0 route mapping.', 'difficulty': 'MEDIUM'},
        {'section': 'Cloud', 'topic': 'Content Delivery', 'subtopic': 'Edge Locations', 'question': 'What is the primary function of Edge Locations in a Cloud Content Delivery Network (CDN, like Amazon CloudFront)?', 'options': [{'id': 'A', 'text': 'Running heavy persistent relational database engines'}, {'id': 'B', 'text': 'Caching static and dynamic content physically closer to end users to reduce latency'}, {'id': 'C', 'text': 'Performing physical tape backups'}, {'id': 'D', 'text': 'Hosting private corporate LDAP directories'}], 'correctOptionId': 'B', 'explanation': 'CDN edge locations cache web assets geographically close to users, cutting round-trip time and offloading origin servers.', 'difficulty': 'EASY'},
        {'section': 'Cloud', 'topic': 'Cloud Reliability', 'subtopic': 'Fault Tolerance', 'question': 'Which architecture pattern guarantees that a cloud application continues functioning seamlessly even if an entire Availability Zone experiences a blackout?', 'options': [{'id': 'A', 'text': 'Multi-AZ Deployment with Automated Load Balancing'}, {'id': 'B', 'text': 'Single-Instance Hosting on Large Bare Metal'}, {'id': 'C', 'text': 'Manual Weekly System Snapshots'}, {'id': 'D', 'text': 'Containerization without Orchestration'}], 'correctOptionId': 'A', 'explanation': 'Distributing application instances across multiple independent Availability Zones behind a load balancer ensures automatic failover.', 'difficulty': 'EASY'},
        {'section': 'Cloud', 'topic': 'Identity & Access Management', 'subtopic': 'Principle of Least Privilege', 'question': 'What does the Principle of Least Privilege mandate in Cloud IAM policy configuration?', 'options': [{'id': 'A', 'text': 'Assigning Full Administrator access to all developers to speed up releases'}, {'id': 'B', 'text': 'Granting only the minimum essential permissions necessary to perform specific job responsibilities'}, {'id': 'C', 'text': 'Disabling user passwords after 3 days'}, {'id': 'D', 'text': 'Permitting anonymous unauthenticated public read/write access to S3 buckets'}], 'correctOptionId': 'B', 'explanation': 'Least Privilege minimizes security blast radius by restricting access permissions strictly to the actions needed for assigned roles.', 'difficulty': 'EASY'},
        {'section': 'Pseudocode', 'topic': 'Bitwise Operations', 'subtopic': 'Bitwise OR', 'question': 'What is the output of the following pseudocode?\nInteger a, b, c\nSet a = 9, b = 4\nc = a | b\nPrint c', 'options': [{'id': 'A', 'text': '13'}, {'id': 'B', 'text': '0'}, {'id': 'C', 'text': '5'}, {'id': 'D', 'text': '12'}], 'correctOptionId': 'A', 'explanation': '9 = 1001 in binary, 4 = 0100. 1001 | 0100 = 1101 in binary, which is decimal 13.', 'difficulty': 'EASY'},
        {'section': 'Pseudocode', 'topic': 'Conditionals', 'subtopic': 'Ternary Evaluation', 'question': 'What will be printed?\nInteger x = 15, y = 20, z\nz = (x > y) ? (x - y) : (y - x)\nPrint z', 'options': [{'id': 'A', 'text': '-5'}, {'id': 'B', 'text': '5'}, {'id': 'C', 'text': '35'}, {'id': 'D', 'text': '0'}], 'correctOptionId': 'B', 'explanation': 'x > y (15 > 20) is false, so the ternary operator evaluates the false branch: (y - x) = (20 - 15) = 5.', 'difficulty': 'EASY'},
        {'section': 'Pseudocode', 'topic': 'Loops & Accumulators', 'subtopic': 'While Loop', 'question': 'What is the final value of count?\nInteger n = 16, count = 0\nWhile (n > 1)\n  n = n / 2\n  count = count + 1\nEnd While\nPrint count', 'options': [{'id': 'A', 'text': '3'}, {'id': 'B', 'text': '4'}, {'id': 'C', 'text': '5'}, {'id': 'D', 'text': '16'}], 'correctOptionId': 'B', 'explanation': 'n successive values: 16 -> 8 (count=1) -> 4 (count=2) -> 2 (count=3) -> 1 (count=4). Loop terminates when n=1. Output: 4.', 'difficulty': 'EASY'},
        {'section': 'Pseudocode', 'topic': 'Array Logic', 'subtopic': 'Maximum Search', 'question': 'What is the value of m after execution?\nInteger arr[4] = {12, 45, 8, 32}\nInteger m = arr[0], i\nFor i = 1 to 3\n  If (arr[i] > m)\n    m = arr[i]\n  End If\nEnd For\nPrint m', 'options': [{'id': 'A', 'text': '12'}, {'id': 'B', 'text': '8'}, {'id': 'C', 'text': '45'}, {'id': 'D', 'text': '32'}], 'correctOptionId': 'C', 'explanation': 'This pseudocode tracks the maximum element in the array: arr[1] is 45, which replaces 12 as the maximum.', 'difficulty': 'EASY'},
        {'section': 'Pseudocode', 'topic': 'String Length', 'subtopic': 'Character Traversal', 'question': "What will be printed?\nString s = 'ACCENTURE'\nInteger len = 0\nWhile (s[len] != NULL)\n  len = len + 1\nEnd While\nPrint len", 'options': [{'id': 'A', 'text': '9'}, {'id': 'B', 'text': '8'}, {'id': 'C', 'text': '10'}, {'id': 'D', 'text': '0'}], 'correctOptionId': 'A', 'explanation': "The characters in 'ACCENTURE' are A-C-C-E-N-T-U-R-E (9 characters total). len increments to 9 before encountering the null terminator.", 'difficulty': 'EASY'},
        {'section': 'Computer Fundamentals', 'topic': 'Operating Systems', 'subtopic': 'Page Replacement', 'question': 'Which page replacement algorithm replaces the page that has not been accessed for the longest period of time?', 'options': [{'id': 'A', 'text': 'FIFO (First In First Out)'}, {'id': 'B', 'text': 'LRU (Least Recently Used)'}, {'id': 'C', 'text': 'Optimal Page Replacement'}, {'id': 'D', 'text': 'LFU (Least Frequently Used)'}], 'correctOptionId': 'B', 'explanation': 'LRU (Least Recently Used) keeps track of page access history and replaces the page unreferenced for the longest time.', 'difficulty': 'EASY'},
        {'section': 'Computer Fundamentals', 'topic': 'Memory Hierarchy', 'subtopic': 'Locality of Reference', 'question': 'What computer architecture principle allows high cache hit rates by anticipating that nearby memory locations will be accessed soon?', 'options': [{'id': 'A', 'text': 'Temporal Locality'}, {'id': 'B', 'text': 'Spatial Locality'}, {'id': 'C', 'text': 'Virtual Addressing'}, {'id': 'D', 'text': 'Branch Prediction'}], 'correctOptionId': 'B', 'explanation': 'Spatial Locality states that if a particular storage location is referenced, memory addresses close to it will likely be referenced soon.', 'difficulty': 'MEDIUM'},
        {'section': 'DBMS', 'topic': 'Relational Integrity', 'subtopic': 'Foreign Keys', 'question': "In SQL, what does the 'ON DELETE CASCADE' constraint achieve on a foreign key relationship?", 'options': [{'id': 'A', 'text': 'Prevents deletion of rows in the parent table if child rows exist'}, {'id': 'B', 'text': 'Automatically deletes matching rows in the child table when the referenced parent row is deleted'}, {'id': 'C', 'text': 'Sets the child foreign key column value to NULL upon parent deletion'}, {'id': 'D', 'text': 'Drops the child table from the schema'}], 'correctOptionId': 'B', 'explanation': 'ON DELETE CASCADE ensures referential integrity by automatically propagating deletions in parent tables down to related child records.', 'difficulty': 'MEDIUM'},
        {'section': 'DBMS', 'topic': 'SQL Joins', 'subtopic': 'Full Outer Join', 'question': 'Which SQL join returns all records when there is a match in either left or right table, filling unmatched columns with NULL?', 'options': [{'id': 'A', 'text': 'INNER JOIN'}, {'id': 'B', 'text': 'LEFT JOIN'}, {'id': 'C', 'text': 'FULL OUTER JOIN'}, {'id': 'D', 'text': 'CROSS JOIN'}], 'correctOptionId': 'C', 'explanation': 'A FULL OUTER JOIN produces the union of results from both LEFT and RIGHT joins, padding non-matching rows with NULLs.', 'difficulty': 'EASY'},
        {'section': 'Java', 'topic': 'OOP Concepts', 'subtopic': 'Encapsulation', 'question': 'How is Encapsulation primarily enforced in Java object-oriented design?', 'options': [{'id': 'A', 'text': 'By declaring instance variables as public and accessing them directly'}, {'id': 'B', 'text': 'By declaring instance variables as private and providing public getter and setter methods'}, {'id': 'C', 'text': 'By making every class an abstract class'}, {'id': 'D', 'text': 'By declaring all methods static'}], 'correctOptionId': 'B', 'explanation': 'Encapsulation restricts direct state access by keeping class fields private and controlling mutations via public getters and setters.', 'difficulty': 'EASY'},
        {'section': 'Java', 'topic': 'Java Keywords', 'subtopic': 'Final Keyword', 'question': "What is the consequence of applying the 'final' keyword to a Java method declaration?", 'options': [{'id': 'A', 'text': 'The method cannot be overloaded'}, {'id': 'B', 'text': 'The method cannot be overridden by subclasses'}, {'id': 'C', 'text': 'The method executes only once during JVM startup'}, {'id': 'D', 'text': 'The method cannot return a value'}], 'correctOptionId': 'B', 'explanation': 'A final method cannot be overridden in child classes, ensuring that its specific implementation cannot be changed.', 'difficulty': 'EASY'},
        {'section': 'DevOps', 'topic': 'Infrastructure as Code', 'subtopic': 'Terraform', 'question': 'Which declarative Infrastructure as Code (IaC) tool uses HCL (HashiCorp Configuration Language) to provision cloud resources across providers?', 'options': [{'id': 'A', 'text': 'Ansible'}, {'id': 'B', 'text': 'Jenkins'}, {'id': 'C', 'text': 'Terraform'}, {'id': 'D', 'text': 'Prometheus'}], 'correctOptionId': 'C', 'explanation': 'Terraform is an open-source declarative IaC tool allowing users to define and provision data center infrastructure using HCL files.', 'difficulty': 'EASY'},
        {'section': 'DevOps', 'topic': 'Deployment Strategies', 'subtopic': 'Canary Releases', 'question': "What defines a 'Canary Deployment' strategy in modern CI/CD?", 'options': [{'id': 'A', 'text': 'Replacing all production servers simultaneously during maintenance'}, {'id': 'B', 'text': 'Deploying a new software version to a small percentage of real users before rolling it out to the entire infrastructure'}, {'id': 'C', 'text': 'Deploying code only on staging environments'}, {'id': 'D', 'text': 'Deleting historical deployment artifacts'}], 'correctOptionId': 'B', 'explanation': 'Canary deployments roll out changes to a small fraction of users first, monitoring telemetry and error rates before full release.', 'difficulty': 'MEDIUM'},
        {'section': 'Communication', 'topic': 'Professional Etiquette', 'subtopic': 'Email Protocols', 'question': "When should the 'BCC' (Blind Carbon Copy) field be used in professional corporate email communication?", 'options': [{'id': 'A', 'text': 'To notify direct superiors when expecting a response from them'}, {'id': 'B', 'text': 'To distribute an email to a large external distribution list while protecting recipient email addresses from disclosure'}, {'id': 'C', 'text': 'To send email attachments exceeding 50 MB'}, {'id': 'D', 'text': 'To indicate that all recipients should reply-all'}], 'correctOptionId': 'B', 'explanation': 'BCC conceals individual email addresses from other recipients, ensuring confidentiality on bulk distributions.', 'difficulty': 'EASY'},
        {'section': 'Communication', 'topic': 'Grammar', 'subtopic': 'Active vs Passive Voice', 'question': 'Identify the sentence written in Active Voice:', 'options': [{'id': 'A', 'text': 'The critical security vulnerability was patched by the DevOps engineer.'}, {'id': 'B', 'text': 'The DevOps engineer patched the critical security vulnerability.'}, {'id': 'C', 'text': 'A patch had been deployed across all clusters by the team.'}, {'id': 'D', 'text': 'The code review will be completed by the team lead tomorrow.'}], 'correctOptionId': 'B', 'explanation': "In active voice, the subject performs the action ('The DevOps engineer [subject] patched [verb] the vulnerability [object]').", 'difficulty': 'EASY'},
    ])
    data.extend([
        {'section': 'Cybersecurity', 'topic': 'Access Control', 'subtopic': 'Role-Based Access Control', 'question': 'Which access control model restricts system access based on user job roles and privileges within an organization?', 'options': [{'id': 'A', 'text': 'Discretionary Access Control (DAC)'}, {'id': 'B', 'text': 'Mandatory Access Control (MAC)'}, {'id': 'C', 'text': 'Attribute-Based Access Control (ABAC)'}, {'id': 'D', 'text': 'Role-Based Access Control (RBAC)'}], 'correctOptionId': 'D', 'explanation': 'RBAC assigns permissions to specific organizational roles rather than individual accounts, simplifying enterprise administration.', 'difficulty': 'EASY'},
        {'section': 'Cybersecurity', 'topic': 'Public Key Infrastructure', 'subtopic': 'Digital Certificates', 'question': 'Which trusted authority digitally signs X.509 SSL/TLS certificates to validate identity on the web?', 'options': [{'id': 'A', 'text': 'Internet Assigned Numbers Authority (IANA)'}, {'id': 'B', 'text': 'Domain Name Registrar'}, {'id': 'C', 'text': 'Certificate Authority (CA)'}, {'id': 'D', 'text': 'Regional Internet Registry (RIR)'}], 'correctOptionId': 'C', 'explanation': 'A Certificate Authority (CA) verifies applicant identities and digitally signs certificates to guarantee trust in public key infrastructure.', 'difficulty': 'EASY'},
        {'section': 'Cloud', 'topic': 'Disaster Recovery', 'subtopic': 'RTO vs RPO', 'question': 'What metric defines the maximum acceptable duration of data loss measured in time backward from a catastrophic outage?', 'options': [{'id': 'A', 'text': 'Recovery Time Objective (RTO)'}, {'id': 'B', 'text': 'Mean Time Between Failures (MTBF)'}, {'id': 'C', 'text': 'Service Level Objective (SLO)'}, {'id': 'D', 'text': 'Recovery Point Objective (RPO)'}], 'correctOptionId': 'D', 'explanation': 'RPO (Recovery Point Objective) represents acceptable data loss measured back in time (e.g. 15 minutes of transactional data).', 'difficulty': 'MEDIUM'},
        {'section': 'Cloud', 'topic': 'Managed Databases', 'subtopic': 'NoSQL Models', 'question': 'Which cloud-native database category stores data as flexible, semi-structured JSON-like documents (e.g. MongoDB, AWS DynamoDB)?', 'options': [{'id': 'A', 'text': 'Relational OLAP Database'}, {'id': 'B', 'text': 'Columnar Data Warehouse'}, {'id': 'C', 'text': 'Document / Key-Value NoSQL Store'}, {'id': 'D', 'text': 'Graph Property Store'}], 'correctOptionId': 'C', 'explanation': 'Document-based NoSQL engines store self-describing JSON/BSON structures allowing dynamic, schemaless scaling.', 'difficulty': 'EASY'},
        {'section': 'Networking', 'topic': 'Network Troubleshooting', 'subtopic': 'Traceroute', 'question': 'Which IP header field is systematically incremented from 1 upwards by the traceroute utility to discover intermediate routers?', 'options': [{'id': 'A', 'text': 'Protocol identifier'}, {'id': 'B', 'text': 'Checksum'}, {'id': 'C', 'text': 'Identification'}, {'id': 'D', 'text': 'Time to Live (TTL)'}], 'correctOptionId': 'D', 'explanation': 'Traceroute sends packets with increasing TTL values (1, 2, 3...); each router decrements TTL, expiring it and sending ICMP Time Exceeded.', 'difficulty': 'MEDIUM'},
        {'section': 'Networking', 'topic': 'Wireless Networking', 'subtopic': 'WPA3 Security', 'question': 'Which cryptographic handshake replaces the vulnerable 4-way Pre-Shared Key handshake in WPA3 Wi-Fi security?', 'options': [{'id': 'A', 'text': 'WEP 128-bit RC4'}, {'id': 'B', 'text': 'WPA Enterprise TKIP'}, {'id': 'C', 'text': 'Simultaneous Authentication of Equals (SAE)'}, {'id': 'D', 'text': 'MD5 Challenge-Response'}], 'correctOptionId': 'C', 'explanation': 'WPA3 uses SAE (Simultaneous Authentication of Equals / Dragonfly handshake) to prevent offline dictionary and eavesdropping attacks.', 'difficulty': 'MEDIUM'},
        {'section': 'MS Office', 'topic': 'Excel', 'subtopic': 'Logical Functions', 'question': 'Which Excel function evaluates multiple conditions and returns a value corresponding to the first TRUE condition?', 'options': [{'id': 'A', 'text': 'IFERROR'}, {'id': 'B', 'text': 'CHOOSE'}, {'id': 'C', 'text': 'AND'}, {'id': 'D', 'text': 'IFS'}], 'correctOptionId': 'D', 'explanation': 'IFS(logical_test1, value_if_true1, [logical_test2, value_if_true2], ...) checks multiple criteria without nested IF statements.', 'difficulty': 'EASY'},
        {'section': 'MS Office', 'topic': 'Word', 'subtopic': 'Referencing', 'question': 'Which feature in Microsoft Word automatically generates a Table of Contents based on structured text?', 'options': [{'id': 'A', 'text': 'Hyperlink list'}, {'id': 'B', 'text': 'Bookmarks menu'}, {'id': 'C', 'text': 'Heading Styles (Heading 1, Heading 2, Heading 3)'}, {'id': 'D', 'text': 'Footnote citations'}], 'correctOptionId': 'C', 'explanation': 'Word builds an automatic Table of Contents by scanning text formatted with predefined Heading 1, 2, and 3 styles.', 'difficulty': 'EASY'},
        {'section': 'Pseudocode', 'topic': 'String Manipulation', 'subtopic': 'Palindrome Check', 'question': "What is the output of the following pseudocode?\nString str = 'RADAR'\nInteger n = 5, flag = 1, i\nFor i = 0 to n / 2\n  If (str[i] != str[n - 1 - i])\n    flag = 0\n  End If\nEnd For\nPrint flag", 'options': [{'id': 'A', 'text': '0'}, {'id': 'B', 'text': '5'}, {'id': 'C', 'text': '1'}, {'id': 'D', 'text': '2'}], 'correctOptionId': 'C', 'explanation': "'RADAR' is a palindrome. All character comparisons (R==R, A==A, D==D) match, so flag remains 1.", 'difficulty': 'EASY'},
        {'section': 'Pseudocode', 'topic': 'Recursion', 'subtopic': 'Fibonacci', 'question': 'What is the return value of fib(4)?\nInteger fib(Integer n)\n  If (n <= 1)\n    return n\n  End If\n  return fib(n - 1) + fib(n - 2)\nEnd function fib()', 'options': [{'id': 'A', 'text': '2'}, {'id': 'B', 'text': '5'}, {'id': 'C', 'text': '3'}, {'id': 'D', 'text': '4'}], 'correctOptionId': 'C', 'explanation': 'Fibonacci sequence: fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2, fib(4)=3.', 'difficulty': 'EASY'},
        {'section': 'Pseudocode', 'topic': 'Bitwise Operations', 'subtopic': 'Right Shift', 'question': 'What will be printed?\nInteger x = 40\nx = x >> 2\nPrint x', 'options': [{'id': 'A', 'text': '80'}, {'id': 'B', 'text': '20'}, {'id': 'C', 'text': '160'}, {'id': 'D', 'text': '10'}], 'correctOptionId': 'D', 'explanation': 'Shifting right by 2 bits divides by 2^2 = 4. 40 / 4 = 10.', 'difficulty': 'EASY'},
        {'section': 'Computer Fundamentals', 'topic': 'Processes & Threads', 'subtopic': 'Context Switching', 'question': 'What hardware registers and data must the Operating System save during a CPU Context Switch between two processes?', 'options': [{'id': 'A', 'text': 'Only the hard disk track sectors'}, {'id': 'B', 'text': 'The entire contents of the RAM memory modules'}, {'id': 'C', 'text': 'Process Control Block (PCB), Program Counter, and CPU registers'}, {'id': 'D', 'text': 'The network interface card buffer only'}], 'correctOptionId': 'C', 'explanation': 'The PCB stores the program counter, CPU registers, stack pointers, and process state so execution can resume accurately.', 'difficulty': 'MEDIUM'},
        {'section': 'Computer Fundamentals', 'topic': 'File Systems', 'subtopic': 'Inodes', 'question': 'In Unix/Linux file systems, what critical metadata is stored inside an Inode?', 'options': [{'id': 'A', 'text': 'File permissions, owner UID, file size, timestamps, and pointers to disk data blocks'}, {'id': 'B', 'text': 'The file name and full directory path string only'}, {'id': 'C', 'text': 'The cleartext password of the file creator'}, {'id': 'D', 'text': 'The BIOS bootloader code'}], 'correctOptionId': 'A', 'explanation': 'Inodes store all file attributes and pointers to data blocks, while directory entries store the filename and map it to an inode number.', 'difficulty': 'MEDIUM'},
        {'section': 'DBMS', 'topic': 'Transaction Isolation', 'subtopic': 'Concurrency Anomalies', 'question': 'Which database transaction anomaly occurs when a transaction reads uncommitted data written by another concurrent transaction?', 'options': [{'id': 'A', 'text': 'Non-Repeatable Read'}, {'id': 'B', 'text': 'Phantom Read'}, {'id': 'C', 'text': 'Lost Update'}, {'id': 'D', 'text': 'Dirty Read'}], 'correctOptionId': 'D', 'explanation': 'A Dirty Read occurs when Transaction A reads data modified by Transaction B that has not yet been committed (and may roll back).', 'difficulty': 'MEDIUM'},
        {'section': 'DBMS', 'topic': 'SQL Clauses', 'subtopic': 'COALESCE', 'question': 'In SQL, what does the COALESCE(val1, val2, val3) function return?', 'options': [{'id': 'A', 'text': 'The average of all numeric parameters'}, {'id': 'B', 'text': 'The concatenated string of all inputs'}, {'id': 'C', 'text': 'The first non-null expression in its argument list'}, {'id': 'D', 'text': 'True if all arguments are null'}], 'correctOptionId': 'C', 'explanation': 'COALESCE evaluates arguments in order and returns the first non-NULL value encountered.', 'difficulty': 'EASY'},
        {'section': 'Java', 'topic': 'Memory Management', 'subtopic': 'Garbage Collection', 'question': 'Which memory region in the Java Virtual Machine (JVM) is shared across all threads and stores all instantiated objects?', 'options': [{'id': 'A', 'text': 'Call Stack'}, {'id': 'B', 'text': 'Program Counter Register'}, {'id': 'C', 'text': 'Native Method Stack'}, {'id': 'D', 'text': 'Heap Memory'}], 'correctOptionId': 'D', 'explanation': 'The JVM Heap is the shared runtime data area where all class instances and arrays are allocated and managed by Garbage Collection.', 'difficulty': 'EASY'},
        {'section': 'Java', 'topic': 'Interfaces & Classes', 'subtopic': 'Abstract Classes', 'question': 'What is a defining rule of an Abstract Class in Java?', 'options': [{'id': 'A', 'text': "It can be directly instantiated using the 'new' keyword"}, {'id': 'B', 'text': 'It cannot contain any concrete methods with implementations'}, {'id': 'C', 'text': 'It cannot be instantiated directly and must be subclassed to create objects'}, {'id': 'D', 'text': 'All its fields must be declared private and static'}], 'correctOptionId': 'C', 'explanation': "Abstract classes cannot be instantiated with 'new'; they serve as templates for concrete subclasses that implement abstract methods.", 'difficulty': 'EASY'},
        {'section': 'DevOps', 'topic': 'Git Commands', 'subtopic': 'Cherry-pick', 'question': 'Which Git command applies the changes introduced by a specific existing commit from another branch onto the current HEAD?', 'options': [{'id': 'A', 'text': 'git rebase --onto'}, {'id': 'B', 'text': 'git stash apply'}, {'id': 'C', 'text': 'git cherry-pick'}, {'id': 'D', 'text': 'git clone --single-branch'}], 'correctOptionId': 'C', 'explanation': "git cherry-pick <commit-hash> applies a specific commit's changes onto your active working branch.", 'difficulty': 'EASY'},
        {'section': 'DevOps', 'topic': 'Container Orchestration', 'subtopic': 'Kubernetes Services', 'question': "Which Kubernetes Service type exposes the service externally using a cloud provider's dedicated external load balancer?", 'options': [{'id': 'A', 'text': 'ClusterIP'}, {'id': 'B', 'text': 'NodePort'}, {'id': 'C', 'text': 'Headless Service'}, {'id': 'D', 'text': 'LoadBalancer'}], 'correctOptionId': 'D', 'explanation': 'The LoadBalancer service type automatically provisions an external cloud load balancer (e.g. AWS NLB) directing to cluster nodes.', 'difficulty': 'EASY'},
        {'section': 'Communication', 'topic': 'Professional Vocabulary', 'subtopic': 'Corporate Idioms', 'question': "In project management, what does the term 'Scope Creep' mean?", 'options': [{'id': 'A', 'text': 'Reducing project budget midway through development'}, {'id': 'B', 'text': 'Uncontrolled expansion of project deliverables and requirements without adjustments to time, budget, or resources'}, {'id': 'C', 'text': 'A team member quitting during a project cycle'}, {'id': 'D', 'text': 'Accelerating code deployment ahead of schedule'}], 'correctOptionId': 'B', 'explanation': 'Scope creep refers to gradual, uncontrolled changes or continuous growth in project scope without corresponding budget/schedule increases.', 'difficulty': 'EASY'},
        {'section': 'Communication', 'topic': 'Grammar', 'subtopic': 'Modal Verbs', 'question': 'Which modal verb best expresses a formal corporate recommendation or moral obligation?', 'options': [{'id': 'A', 'text': 'might'}, {'id': 'B', 'text': 'could'}, {'id': 'C', 'text': 'ought to'}, {'id': 'D', 'text': 'would'}], 'correctOptionId': 'C', 'explanation': "'Ought to' expresses duty, ethical correctness, or strong recommendation (e.g. 'Employees ought to report security incidents immediately').", 'difficulty': 'MEDIUM'},
    ])
    data.extend([
        {'section': 'MS Office', 'topic': 'Excel', 'subtopic': 'Keyboard Shortcuts', 'question': 'Which keyboard shortcut toggles between displaying cell values and displaying formula syntax in Excel?', 'options': [{'id': 'A', 'text': 'Ctrl + ` (Backquote)'}, {'id': 'B', 'text': 'Ctrl + F9'}, {'id': 'C', 'text': 'Alt + Enter'}, {'id': 'D', 'text': 'Shift + F3'}], 'correctOptionId': 'A', 'explanation': 'Ctrl + ` (grave accent/backquote) toggles formula auditing view, showing all formulas in cells instead of calculated results.', 'difficulty': 'EASY'},
        {'section': 'MS Office', 'topic': 'Word', 'subtopic': 'Special Characters', 'question': 'What is the default shortcut key combination to insert the Copyright symbol (©) in Microsoft Word?', 'options': [{'id': 'A', 'text': 'Ctrl + C'}, {'id': 'B', 'text': 'Alt + C'}, {'id': 'C', 'text': 'Shift + C'}, {'id': 'D', 'text': 'Ctrl + Alt + C'}], 'correctOptionId': 'D', 'explanation': 'Ctrl + Alt + C immediately inserts the copyright symbol (©) in Microsoft Word.', 'difficulty': 'EASY'},
        {'section': 'Networking', 'topic': 'Transport Layer', 'subtopic': 'UDP Characteristics', 'question': 'Which of the following transport layer characteristics specifically describes the User Datagram Protocol (UDP)?', 'options': [{'id': 'A', 'text': 'Connectionless, low-overhead transmission without delivery guarantees or retransmission'}, {'id': 'B', 'text': 'Strict three-way handshake and guaranteed packet ordering'}, {'id': 'C', 'text': 'Windowing flow control and congestion collapse backoff'}, {'id': 'D', 'text': 'Full-duplex byte stream acknowledgement'}], 'correctOptionId': 'A', 'explanation': 'UDP is lightweight, connectionless, and best-effort; it does not perform handshakes or retransmissions, ideal for streaming/gaming/DNS.', 'difficulty': 'EASY'},
        {'section': 'Networking', 'topic': 'Switching', 'subtopic': 'Forwarding Tables', 'question': 'What data structure does a Layer 2 network switch dynamically build to map hardware addresses to specific physical ports?', 'options': [{'id': 'A', 'text': 'Routing Information Base (RIB)'}, {'id': 'B', 'text': 'ARP Cache'}, {'id': 'C', 'text': 'DNS Zone Table'}, {'id': 'D', 'text': 'CAM (Content Addressable Memory) / MAC Address Table'}], 'correctOptionId': 'D', 'explanation': 'Switches record incoming source MAC addresses and ingress ports in the CAM / MAC address table for frame forwarding.', 'difficulty': 'MEDIUM'},
        {'section': 'Cybersecurity', 'topic': 'Network Security', 'subtopic': 'Honeypots', 'question': "What is the primary operational purpose of deploying a 'Honeypot' in an enterprise network?", 'options': [{'id': 'A', 'text': 'To accelerate database indexing speeds'}, {'id': 'B', 'text': 'To replace perimeter firewalls'}, {'id': 'C', 'text': 'To store production source code repositories'}, {'id': 'D', 'text': 'To lure, detect, and study unauthorized attacker activity in an isolated decoy system'}], 'correctOptionId': 'D', 'explanation': 'Honeypots act as decoy resources with no legitimate business traffic, so any interaction indicates adversarial or unauthorized probing.', 'difficulty': 'EASY'},
        {'section': 'Cybersecurity', 'topic': 'Cryptography', 'subtopic': 'Digital Signatures', 'question': 'Which two core security objectives are achieved when a sender attaches a Digital Signature to a document?', 'options': [{'id': 'A', 'text': 'Authentication and Non-Repudiation with Integrity'}, {'id': 'B', 'text': 'Payload compression and rate limiting'}, {'id': 'C', 'text': 'High throughput and port forwarding'}, {'id': 'D', 'text': 'DNS resolution and NAT traversal'}], 'correctOptionId': 'A', 'explanation': "Digital signatures prove authenticity of the sender (using sender's private key), ensure document integrity, and enforce non-repudiation.", 'difficulty': 'MEDIUM'},
        {'section': 'Cloud', 'topic': 'Cloud Networking', 'subtopic': 'Security Groups', 'question': 'In cloud VPC architecture (e.g. AWS Security Groups), what is the default behavior regarding statefulness?', 'options': [{'id': 'A', 'text': 'They are completely stateless, requiring manual inbound and outbound rules for return traffic'}, {'id': 'B', 'text': 'They cannot filter inbound traffic based on port numbers'}, {'id': 'C', 'text': 'They operate only at Layer 7 of the OSI model'}, {'id': 'D', 'text': 'They are stateful: return traffic for allowed inbound requests is automatically permitted outbound'}], 'correctOptionId': 'D', 'explanation': 'Security Groups are stateful virtual firewalls; return traffic is automatically tracked and allowed regardless of outbound rules.', 'difficulty': 'MEDIUM'},
        {'section': 'Cloud', 'topic': 'Compute', 'subtopic': 'Autoscaling', 'question': 'What triggering mechanism causes an Auto Scaling Group to launch additional cloud VM instances during peak traffic?', 'options': [{'id': 'A', 'text': 'A CloudWatch metric alarm (e.g. average CPU utilization exceeding 75%)'}, {'id': 'B', 'text': 'Physical hardware server temperature alerts'}, {'id': 'C', 'text': 'Manual restart of DNS root servers'}, {'id': 'D', 'text': 'Expiration of SSL certificates'}], 'correctOptionId': 'A', 'explanation': 'Auto Scaling Groups monitor telemetry alarms (such as average CPU utilization or request queue depth) to scale instances up or down dynamically.', 'difficulty': 'EASY'},
        {'section': 'Pseudocode', 'topic': 'Bitwise Operations', 'subtopic': 'Power of Two Check', 'question': "What does the expression '(n & (n - 1)) == 0' determine for a positive integer n?", 'options': [{'id': 'A', 'text': 'Whether n is an odd number'}, {'id': 'B', 'text': 'Whether n is a prime number'}, {'id': 'C', 'text': 'Whether n is negative'}, {'id': 'D', 'text': 'Whether n is an exact power of two'}], 'correctOptionId': 'D', 'explanation': 'Powers of two have exactly one bit set in binary (e.g. 8 is 1000, 7 is 0111). n & (n - 1) clears the lowest set bit, yielding 0.', 'difficulty': 'MEDIUM'},
        {'section': 'Pseudocode', 'topic': 'Recursion', 'subtopic': 'Power Function', 'question': 'What will be the output of power(2, 3)?\nInteger power(Integer base, Integer exp)\n  If (exp == 0)\n    return 1\n  End If\n  return base * power(base, exp - 1)\nEnd function', 'options': [{'id': 'A', 'text': '6'}, {'id': 'B', 'text': '9'}, {'id': 'C', 'text': '4'}, {'id': 'D', 'text': '8'}], 'correctOptionId': 'D', 'explanation': 'power(2, 3) computes 2 * power(2, 2) = 2 * (2 * power(2, 1)) = 2 * 2 * 2 = 8.', 'difficulty': 'EASY'},
        {'section': 'Computer Fundamentals', 'topic': 'Computer Architecture', 'subtopic': 'Von Neumann Architecture', 'question': 'What defining principle characterizes the classic Von Neumann computer architecture?', 'options': [{'id': 'A', 'text': 'Program instructions and data share the same unified physical memory space and bus system'}, {'id': 'B', 'text': 'Instructions are permanently hardwired into silicon without memory'}, {'id': 'C', 'text': 'Separate physical buses and memories are strictly required for code and data'}, {'id': 'D', 'text': 'The CPU does not possess an Arithmetic Logic Unit'}], 'correctOptionId': 'A', 'explanation': 'Von Neumann architecture stores both program instructions and user data in the same unified read-write memory space.', 'difficulty': 'EASY'},
        {'section': 'Computer Fundamentals', 'topic': 'Operating Systems', 'subtopic': 'Disk Scheduling', 'question': 'Which disk scheduling algorithm moves the disk arm across all tracks servicing requests, reversing direction only when the end is reached?', 'options': [{'id': 'A', 'text': 'FCFS'}, {'id': 'B', 'text': 'SSTF (Shortest Seek Time First)'}, {'id': 'C', 'text': 'FIFO'}, {'id': 'D', 'text': 'SCAN (Elevator Algorithm)'}], 'correctOptionId': 'D', 'explanation': 'The SCAN algorithm services track requests in one direction toward the edge of the disk and then sweeps backward like an elevator.', 'difficulty': 'EASY'},
        {'section': 'DBMS', 'topic': 'SQL Window Functions', 'subtopic': 'Ranking', 'question': 'Which SQL window function assigns consecutive ranks without skipping rank numbers when ties occur?', 'options': [{'id': 'A', 'text': 'RANK()'}, {'id': 'B', 'text': 'ROW_NUMBER()'}, {'id': 'C', 'text': 'NTILE()'}, {'id': 'D', 'text': 'DENSE_RANK()'}], 'correctOptionId': 'D', 'explanation': 'DENSE_RANK() assigns identical ranks to ties and continues with the immediate next integer (e.g. 1, 2, 2, 3), whereas RANK() skips (1, 2, 2, 4).', 'difficulty': 'MEDIUM'},
        {'section': 'DBMS', 'topic': 'Database Architecture', 'subtopic': 'Views', 'question': 'What is a Materialized View in enterprise relational database systems?', 'options': [{'id': 'A', 'text': 'A temporary table that deletes itself after 5 seconds'}, {'id': 'B', 'text': 'A virtual query definition that does not store any data physically on disk'}, {'id': 'C', 'text': 'A stored query whose result set is physically saved on disk and can be refreshed periodically for fast querying'}, {'id': 'D', 'text': 'A database index created only on primary keys'}], 'correctOptionId': 'C', 'explanation': 'Materialized views persist query results on disk, avoiding repeated computation of complex joins and aggregations at query time.', 'difficulty': 'MEDIUM'},
        {'section': 'Java', 'topic': 'Java Concurrency', 'subtopic': 'Volatile Keyword', 'question': "What guarantee does the 'volatile' keyword provide for a variable in multithreaded Java applications?", 'options': [{'id': 'A', 'text': 'All reads and writes go directly to main memory, ensuring immediate visibility across all CPU caches'}, {'id': 'B', 'text': 'The variable is protected by an automatic reentrant mutual exclusion lock'}, {'id': 'C', 'text': 'Compound operations like count++ become strictly atomic'}, {'id': 'D', 'text': 'The variable cannot be garbage collected'}], 'correctOptionId': 'A', 'explanation': 'volatile establishes happens-before visibility guarantees by flushing reads and writes directly to main memory rather than thread local caches.', 'difficulty': 'MEDIUM'},
        {'section': 'Java', 'topic': 'Collections', 'subtopic': 'Set Implementations', 'question': 'Which Java Set implementation guarantees that elements are maintained in sorted ascending natural order?', 'options': [{'id': 'A', 'text': 'HashSet'}, {'id': 'B', 'text': 'LinkedHashSet'}, {'id': 'C', 'text': 'CopyOnWriteArraySet'}, {'id': 'D', 'text': 'TreeSet'}], 'correctOptionId': 'D', 'explanation': 'TreeSet is backed by a Red-Black Tree, guaranteeing ascending sorted traversal order according to Comparable or Comparator.', 'difficulty': 'EASY'},
        {'section': 'DevOps', 'topic': 'Version Control', 'subtopic': 'Git Stash', 'question': 'Which command in Git temporarily shelves uncommitted local modifications so the working tree matches the HEAD commit?', 'options': [{'id': 'A', 'text': 'git reset --hard'}, {'id': 'B', 'text': 'git clean -fd'}, {'id': 'C', 'text': 'git revert HEAD'}, {'id': 'D', 'text': 'git stash'}], 'correctOptionId': 'D', 'explanation': 'git stash saves dirty working state on a storage stack and reverts working directory to clean HEAD state.', 'difficulty': 'EASY'},
        {'section': 'DevOps', 'topic': 'Continuous Delivery', 'subtopic': 'Blue-Green Deployment', 'question': 'What is the primary benefit of a Blue-Green deployment architecture?', 'options': [{'id': 'A', 'text': 'Eliminating software testing requirements'}, {'id': 'B', 'text': 'Near-zero downtime deployment and instantaneous rollback capability by switching router traffic between identical environments'}, {'id': 'C', 'text': 'Halving cloud infrastructure hardware costs'}, {'id': 'D', 'text': 'Automatically refactoring legacy code into serverless functions'}], 'correctOptionId': 'B', 'explanation': 'Blue-Green deployment runs two identical production environments (Blue active, Green new release); traffic is cut over instantly via load balancer.', 'difficulty': 'EASY'},
        {'section': 'Communication', 'topic': 'Sentence Correction', 'subtopic': 'Parallelism', 'question': 'Select the sentence that maintains correct grammatical Parallel Structure:', 'options': [{'id': 'A', 'text': 'The candidate enjoys debugging code, designing architectures, and to write tests.'}, {'id': 'B', 'text': 'The candidate enjoys debugging code, designing architectures, and writing tests.'}, {'id': 'C', 'text': 'The candidate enjoys to debug code, designing architectures, and writes tests.'}, {'id': 'D', 'text': 'The candidate enjoys debug, design, and writing test cases.'}], 'correctOptionId': 'B', 'explanation': 'Parallel structure requires series items to share the same grammatical form (gerunds: debugging, designing, writing).', 'difficulty': 'MEDIUM'},
        {'section': 'Communication', 'topic': 'Professional Vocabulary', 'subtopic': 'Precision', 'question': "Choose the word that best completes the sentence: 'The engineering director gave her ________ to proceed with the database migration schedule.'", 'options': [{'id': 'A', 'text': 'ascent'}, {'id': 'B', 'text': 'accent'}, {'id': 'C', 'text': 'assent'}, {'id': 'D', 'text': 'access'}], 'correctOptionId': 'C', 'explanation': "'Assent' means official agreement or approval. ('Ascent' refers to upward climbing; 'accent' refers to pronunciation).", 'difficulty': 'MEDIUM'},
    ])
    return data
