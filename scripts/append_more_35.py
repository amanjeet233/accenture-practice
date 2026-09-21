more_75 = [
    # --- MS OFFICE ---
    {
        "section": "MS Office",
        "topic": "Excel",
        "subtopic": "Text Functions",
        "question": "Which Excel formula extracts the first 5 characters from text stored in cell A2?",
        "options": [
            {"id": "A", "text": "=MID(A2, 5)"},
            {"id": "B", "text": "=FIRST(A2, 5)"},
            {"id": "C", "text": "=LEFT(A2, 5)"},
            {"id": "D", "text": "=SUBSTRING(A2, 1, 5)"}
        ],
        "correctOptionId": "C",
        "explanation": "=LEFT(text, [num_chars]) extracts the specified number of characters starting from the far left of a text string.",
        "difficulty": "EASY"
    },
    {
        "section": "MS Office",
        "topic": "Excel",
        "subtopic": "Cell Referencing",
        "question": "What kind of cell reference is represented by '$C$10' in an Excel formula?",
        "options": [
            {"id": "A", "text": "Relative Reference"},
            {"id": "B", "text": "Absolute Reference"},
            {"id": "C", "text": "Mixed Reference with locked row only"},
            {"id": "D", "text": "Circular Reference"}
        ],
        "correctOptionId": "B",
        "explanation": "Placing a dollar sign before both the column letter and row number ($C$10) creates an absolute reference that does not change when copied.",
        "difficulty": "EASY"
    },
    {
        "section": "MS Office",
        "topic": "Word",
        "subtopic": "Document Views",
        "question": "Which view in Microsoft Word displays the document exactly as it will look when printed on physical paper?",
        "options": [
            {"id": "A", "text": "Draft View"},
            {"id": "B", "text": "Web Layout View"},
            {"id": "C", "text": "Outline View"},
            {"id": "D", "text": "Print Layout View"}
        ],
        "correctOptionId": "D",
        "explanation": "Print Layout View shows margins, page breaks, headers, and footers exactly as they will appear when printed.",
        "difficulty": "EASY"
    },
    {
        "section": "MS Office",
        "topic": "PowerPoint",
        "subtopic": "Animations & Transitions",
        "question": "In PowerPoint, what is the key difference between an Animation and a Transition?",
        "options": [
            {"id": "A", "text": "Transitions apply to individual objects on a slide, while Animations apply to entire slides"},
            {"id": "B", "text": "Transitions apply to how a slide enters or exits the screen, while Animations apply to individual text or objects within a slide"},
            {"id": "C", "text": "Animations only work on video files, while Transitions only work on shapes"},
            {"id": "D", "text": "There is no difference; they are interchangeable terms"}
        ],
        "correctOptionId": "B",
        "explanation": "Slide Transitions control movement between slides, whereas Animations apply motion effects to specific elements on a slide.",
        "difficulty": "EASY"
    },
    {
        "section": "MS Office",
        "topic": "Excel",
        "subtopic": "Flash Fill",
        "question": "Which Excel shortcut automatically senses patterns in adjacent columns and populates data using Flash Fill?",
        "options": [
            {"id": "A", "text": "Ctrl + E"},
            {"id": "B", "text": "Ctrl + D"},
            {"id": "C", "text": "Ctrl + R"},
            {"id": "D", "text": "Ctrl + F"}
        ],
        "correctOptionId": "A",
        "explanation": "Ctrl + E invokes Flash Fill in Excel, recognizing text patterns (e.g. splitting first and last names) and completing the column automatically.",
        "difficulty": "EASY"
    },

    # --- NETWORKING ---
    {
        "section": "Networking",
        "topic": "Switching",
        "subtopic": "Spanning Tree Protocol",
        "question": "What catastrophic network loop condition is prevented by the Spanning Tree Protocol (STP, IEEE 802.1D)?",
        "options": [
            {"id": "A", "text": "SYN Flood"},
            {"id": "B", "text": "Broadcast Storm"},
            {"id": "C", "text": "IP address exhaustion"},
            {"id": "D", "text": "Buffer Overflow"}
        ],
        "correctOptionId": "B",
        "explanation": "STP prevents bridging loops and resulting broadcast storms by selectively blocking redundant switch ports.",
        "difficulty": "MEDIUM"
    },
    {
        "section": "Networking",
        "topic": "IP Addressing",
        "subtopic": "Private IP Ranges",
        "question": "According to RFC 1918, which of the following represents a private IPv4 address block?",
        "options": [
            {"id": "A", "text": "172.16.0.0 to 172.31.255.255"},
            {"id": "B", "text": "11.0.0.0 to 11.255.255.255"},
            {"id": "C", "text": "192.169.0.0 to 192.169.255.255"},
            {"id": "D", "text": "169.255.0.0 to 169.255.255.255"}
        ],
        "correctOptionId": "A",
        "explanation": "RFC 1918 defines private address spaces: 10.0.0.0/8, 172.16.0.0/12 (up to 172.31.255.255), and 192.168.0.0/16.",
        "difficulty": "MEDIUM"
    },
    {
        "section": "Networking",
        "topic": "Network Layer",
        "subtopic": "ICMP",
        "question": "Which protocol is utilized by network diagnostic tools like 'ping' and 'traceroute' to report errors and connectivity status?",
        "options": [
            {"id": "A", "text": "IGMP"},
            {"id": "B", "text": "SNMP"},
            {"id": "C", "text": "ICMP"},
            {"id": "D", "text": "SMTP"}
        ],
        "correctOptionId": "C",
        "explanation": "ICMP (Internet Control Message Protocol) generates error reporting and operational queries like Echo Request and Echo Reply.",
        "difficulty": "EASY"
    },
    {
        "section": "Networking",
        "topic": "Application Layer Protocols",
        "subtopic": "SSH",
        "question": "What is the standard default TCP port allocated for Secure Shell (SSH) remote administrative access?",
        "options": [
            {"id": "A", "text": "Port 21"},
            {"id": "B", "text": "Port 22"},
            {"id": "C", "text": "Port 23"},
            {"id": "D", "text": "Port 25"}
        ],
        "correctOptionId": "B",
        "explanation": "TCP port 22 is the IANA standard port reserved for encrypted SSH secure logins and SCP/SFTP transfers.",
        "difficulty": "EASY"
    },
    {
        "section": "Networking",
        "topic": "Network Architecture",
        "subtopic": "NAT",
        "question": "Which Network Address Translation (NAT) variation maps multiple private IP addresses to a single public IP address using unique port numbers?",
        "options": [
            {"id": "A", "text": "Static NAT"},
            {"id": "B", "text": "Dynamic NAT"},
            {"id": "C", "text": "Port Address Translation (PAT) / NAT Overload"},
            {"id": "D", "text": "Direct Routing NAT"}
        ],
        "correctOptionId": "C",
        "explanation": "PAT (Port Address Translation), also known as NAT Overload, assigns distinct source port numbers to distinguish concurrent outbound sessions on a single IP.",
        "difficulty": "MEDIUM"
    },

    # --- CYBERSECURITY ---
    {
        "section": "Cybersecurity",
        "topic": "Malware Analysis",
        "subtopic": "Ransomware",
        "question": "Which form of malicious software encrypts victim files and demands payment in cryptocurrency in exchange for the decryption key?",
        "options": [
            {"id": "A", "text": "Spyware"},
            {"id": "B", "text": "Rootkit"},
            {"id": "C", "text": "Adware"},
            {"id": "D", "text": "Ransomware"}
        ],
        "correctOptionId": "D",
        "explanation": "Ransomware utilizes asymmetric/symmetric encryption to hold data hostage until extortion demands are satisfied.",
        "difficulty": "EASY"
    },
    {
        "section": "Cybersecurity",
        "topic": "Web Security",
        "subtopic": "SQL Injection",
        "question": "What is the most effective programmatic defense against SQL Injection vulnerabilities in backend databases?",
        "options": [
            {"id": "A", "text": "Client-side form field length validation"},
            {"id": "B", "text": "Parameterized queries (Prepared Statements) with bound variables"},
            {"id": "C", "text": "Storing database credentials in plain text"},
            {"id": "D", "text": "Disabling database indexes"}
        ],
        "correctOptionId": "B",
        "explanation": "Prepared Statements treat user inputs strictly as literal data parameters rather than executable SQL code, neutralizing SQL injection.",
        "difficulty": "EASY"
    },
    {
        "section": "Cybersecurity",
        "topic": "Cryptography",
        "subtopic": "Hashing Algorithms",
        "question": "Which of the following is a secure cryptographic hash function that produces a 256-bit fixed digest?",
        "options": [
            {"id": "A", "text": "MD5"},
            {"id": "B", "text": "SHA-1"},
            {"id": "C", "text": "SHA-256"},
            {"id": "D", "text": "RC4"}
        ],
        "correctOptionId": "C",
        "explanation": "SHA-256 (part of the SHA-2 family) outputs a 256-bit digest and remains computationally collision-resistant, unlike MD5 and SHA-1.",
        "difficulty": "EASY"
    },
    {
        "section": "Cybersecurity",
        "topic": "Web Security",
        "subtopic": "CSRF Defense",
        "question": "How does an Anti-CSRF (Cross-Site Request Forgery) token defend web applications?",
        "options": [
            {"id": "A", "text": "By compressing cookies sent in HTTP requests"},
            {"id": "B", "text": "By supplying a unique, secret, unpredictable token validated by the server with every state-changing request"},
            {"id": "C", "text": "By disabling JavaScript in the victim's browser"},
            {"id": "D", "text": "By enforcing complex password renewal policies"}
        ],
        "correctOptionId": "B",
        "explanation": "Anti-CSRF tokens cannot be guessed or read by unauthorized third-party origins, preventing forged cross-site POST/PUT commands.",
        "difficulty": "MEDIUM"
    },
    {
        "section": "Cybersecurity",
        "topic": "Social Engineering",
        "subtopic": "Phishing",
        "question": "What term describes a targeted phishing attack directed specifically at senior corporate executives (e.g. CEO, CFO)?",
        "options": [
            {"id": "A", "text": "Spear Phishing"},
            {"id": "B", "text": "Whaling"},
            {"id": "C", "text": "Vishing"},
            {"id": "D", "text": "Smishing"}
        ],
        "correctOptionId": "B",
        "explanation": "Whaling is a highly customized social engineering attack specifically targeting high-profile corporate leaders to steal funds or executive credentials.",
        "difficulty": "EASY"
    },

    # --- CLOUD COMPUTING ---
    {
        "section": "Cloud",
        "topic": "Cloud Elasticity",
        "subtopic": "Scalability",
        "question": "What is the architectural distinction between Vertical Scaling (Scale-Up) and Horizontal Scaling (Scale-Out)?",
        "options": [
            {"id": "A", "text": "Vertical scaling adds more compute instances, while horizontal scaling adds more RAM to an existing single instance"},
            {"id": "B", "text": "Vertical scaling increases CPU/RAM on a single server, while horizontal scaling adds more servers to share workload"},
            {"id": "C", "text": "Vertical scaling is only used in serverless architectures"},
            {"id": "D", "text": "Horizontal scaling requires shutting down all database services"}
        ],
        "correctOptionId": "B",
        "explanation": "Scale-up increases capacity of a single node; scale-out distributes traffic across an array of coordinated commodity instances.",
        "difficulty": "EASY"
    },
    {
        "section": "Cloud",
        "topic": "Virtual Private Cloud",
        "subtopic": "Subnet Routing",
        "question": "What component must be attached to a VPC subnet route table to permit direct bidirectional access to the public Internet?",
        "options": [
            {"id": "A", "text": "Internet Gateway (IGW)"},
            {"id": "B", "text": "VPC Endpoint"},
            {"id": "C", "text": "Virtual Private Gateway (VGW)"},
            {"id": "D", "text": "Direct Connect Link"}
        ],
        "correctOptionId": "A",
        "explanation": "An Internet Gateway (IGW) enables communication between VPC instances and the open Internet via 0.0.0.0/0 route mapping.",
        "difficulty": "MEDIUM"
    },
    {
        "section": "Cloud",
        "topic": "Content Delivery",
        "subtopic": "Edge Locations",
        "question": "What is the primary function of Edge Locations in a Cloud Content Delivery Network (CDN, like Amazon CloudFront)?",
        "options": [
            {"id": "A", "text": "Running heavy persistent relational database engines"},
            {"id": "B", "text": "Caching static and dynamic content physically closer to end users to reduce latency"},
            {"id": "C", "text": "Performing physical tape backups"},
            {"id": "D", "text": "Hosting private corporate LDAP directories"}
        ],
        "correctOptionId": "B",
        "explanation": "CDN edge locations cache web assets geographically close to users, cutting round-trip time and offloading origin servers.",
        "difficulty": "EASY"
    },
    {
        "section": "Cloud",
        "topic": "Cloud Reliability",
        "subtopic": "Fault Tolerance",
        "question": "Which architecture pattern guarantees that a cloud application continues functioning seamlessly even if an entire Availability Zone experiences a blackout?",
        "options": [
            {"id": "A", "text": "Multi-AZ Deployment with Automated Load Balancing"},
            {"id": "B", "text": "Single-Instance Hosting on Large Bare Metal"},
            {"id": "C", "text": "Manual Weekly System Snapshots"},
            {"id": "D", "text": "Containerization without Orchestration"}
        ],
        "correctOptionId": "A",
        "explanation": "Distributing application instances across multiple independent Availability Zones behind a load balancer ensures automatic failover.",
        "difficulty": "EASY"
    },
    {
        "section": "Cloud",
        "topic": "Identity & Access Management",
        "subtopic": "Principle of Least Privilege",
        "question": "What does the Principle of Least Privilege mandate in Cloud IAM policy configuration?",
        "options": [
            {"id": "A", "text": "Assigning Full Administrator access to all developers to speed up releases"},
            {"id": "B", "text": "Granting only the minimum essential permissions necessary to perform specific job responsibilities"},
            {"id": "C", "text": "Disabling user passwords after 3 days"},
            {"id": "D", "text": "Permitting anonymous unauthenticated public read/write access to S3 buckets"}
        ],
        "correctOptionId": "B",
        "explanation": "Least Privilege minimizes security blast radius by restricting access permissions strictly to the actions needed for assigned roles.",
        "difficulty": "EASY"
    },

    # --- PSEUDOCODE ---
    {
        "section": "Pseudocode",
        "topic": "Bitwise Operations",
        "subtopic": "Bitwise OR",
        "question": "What is the output of the following pseudocode?\nInteger a, b, c\nSet a = 9, b = 4\nc = a | b\nPrint c",
        "options": [
            {"id": "A", "text": "13"},
            {"id": "B", "text": "0"},
            {"id": "C", "text": "5"},
            {"id": "D", "text": "12"}
        ],
        "correctOptionId": "A",
        "explanation": "9 = 1001 in binary, 4 = 0100. 1001 | 0100 = 1101 in binary, which is decimal 13.",
        "difficulty": "EASY"
    },
    {
        "section": "Pseudocode",
        "topic": "Conditionals",
        "subtopic": "Ternary Evaluation",
        "question": "What will be printed?\nInteger x = 15, y = 20, z\nz = (x > y) ? (x - y) : (y - x)\nPrint z",
        "options": [
            {"id": "A", "text": "-5"},
            {"id": "B", "text": "5"},
            {"id": "C", "text": "35"},
            {"id": "D", "text": "0"}
        ],
        "correctOptionId": "B",
        "explanation": "x > y (15 > 20) is false, so the ternary operator evaluates the false branch: (y - x) = (20 - 15) = 5.",
        "difficulty": "EASY"
    },
    {
        "section": "Pseudocode",
        "topic": "Loops & Accumulators",
        "subtopic": "While Loop",
        "question": "What is the final value of count?\nInteger n = 16, count = 0\nWhile (n > 1)\n  n = n / 2\n  count = count + 1\nEnd While\nPrint count",
        "options": [
            {"id": "A", "text": "3"},
            {"id": "B", "text": "4"},
            {"id": "C", "text": "5"},
            {"id": "D", "text": "16"}
        ],
        "correctOptionId": "B",
        "explanation": "n successive values: 16 -> 8 (count=1) -> 4 (count=2) -> 2 (count=3) -> 1 (count=4). Loop terminates when n=1. Output: 4.",
        "difficulty": "EASY"
    },
    {
        "section": "Pseudocode",
        "topic": "Array Logic",
        "subtopic": "Maximum Search",
        "question": "What is the value of m after execution?\nInteger arr[4] = {12, 45, 8, 32}\nInteger m = arr[0], i\nFor i = 1 to 3\n  If (arr[i] > m)\n    m = arr[i]\n  End If\nEnd For\nPrint m",
        "options": [
            {"id": "A", "text": "12"},
            {"id": "B", "text": "8"},
            {"id": "C", "text": "45"},
            {"id": "D", "text": "32"}
        ],
        "correctOptionId": "C",
        "explanation": "This pseudocode tracks the maximum element in the array: arr[1] is 45, which replaces 12 as the maximum.",
        "difficulty": "EASY"
    },
    {
        "section": "Pseudocode",
        "topic": "String Length",
        "subtopic": "Character Traversal",
        "question": "What will be printed?\nString s = 'ACCENTURE'\nInteger len = 0\nWhile (s[len] != NULL)\n  len = len + 1\nEnd While\nPrint len",
        "options": [
            {"id": "A", "text": "9"},
            {"id": "B", "text": "8"},
            {"id": "C", "text": "10"},
            {"id": "D", "text": "0"}
        ],
        "correctOptionId": "A",
        "explanation": "The characters in 'ACCENTURE' are A-C-C-E-N-T-U-R-E (9 characters total). len increments to 9 before encountering the null terminator.",
        "difficulty": "EASY"
    },

    # --- COMPUTER FUNDAMENTALS & OS ---
    {
        "section": "Computer Fundamentals",
        "topic": "Operating Systems",
        "subtopic": "Page Replacement",
        "question": "Which page replacement algorithm replaces the page that has not been accessed for the longest period of time?",
        "options": [
            {"id": "A", "text": "FIFO (First In First Out)"},
            {"id": "B", "text": "LRU (Least Recently Used)"},
            {"id": "C", "text": "Optimal Page Replacement"},
            {"id": "D", "text": "LFU (Least Frequently Used)"}
        ],
        "correctOptionId": "B",
        "explanation": "LRU (Least Recently Used) keeps track of page access history and replaces the page unreferenced for the longest time.",
        "difficulty": "EASY"
    },
    {
        "section": "Computer Fundamentals",
        "topic": "Memory Hierarchy",
        "subtopic": "Locality of Reference",
        "question": "What computer architecture principle allows high cache hit rates by anticipating that nearby memory locations will be accessed soon?",
        "options": [
            {"id": "A", "text": "Temporal Locality"},
            {"id": "B", "text": "Spatial Locality"},
            {"id": "C", "text": "Virtual Addressing"},
            {"id": "D", "text": "Branch Prediction"}
        ],
        "correctOptionId": "B",
        "explanation": "Spatial Locality states that if a particular storage location is referenced, memory addresses close to it will likely be referenced soon.",
        "difficulty": "MEDIUM"
    },

    # --- DBMS & SQL ---
    {
        "section": "DBMS",
        "topic": "Relational Integrity",
        "subtopic": "Foreign Keys",
        "question": "In SQL, what does the 'ON DELETE CASCADE' constraint achieve on a foreign key relationship?",
        "options": [
            {"id": "A", "text": "Prevents deletion of rows in the parent table if child rows exist"},
            {"id": "B", "text": "Automatically deletes matching rows in the child table when the referenced parent row is deleted"},
            {"id": "C", "text": "Sets the child foreign key column value to NULL upon parent deletion"},
            {"id": "D", "text": "Drops the child table from the schema"}
        ],
        "correctOptionId": "B",
        "explanation": "ON DELETE CASCADE ensures referential integrity by automatically propagating deletions in parent tables down to related child records.",
        "difficulty": "MEDIUM"
    },
    {
        "section": "DBMS",
        "topic": "SQL Joins",
        "subtopic": "Full Outer Join",
        "question": "Which SQL join returns all records when there is a match in either left or right table, filling unmatched columns with NULL?",
        "options": [
            {"id": "A", "text": "INNER JOIN"},
            {"id": "B", "text": "LEFT JOIN"},
            {"id": "C", "text": "FULL OUTER JOIN"},
            {"id": "D", "text": "CROSS JOIN"}
        ],
        "correctOptionId": "C",
        "explanation": "A FULL OUTER JOIN produces the union of results from both LEFT and RIGHT joins, padding non-matching rows with NULLs.",
        "difficulty": "EASY"
    },

    # --- JAVA & OOP ---
    {
        "section": "Java",
        "topic": "OOP Concepts",
        "subtopic": "Encapsulation",
        "question": "How is Encapsulation primarily enforced in Java object-oriented design?",
        "options": [
            {"id": "A", "text": "By declaring instance variables as public and accessing them directly"},
            {"id": "B", "text": "By declaring instance variables as private and providing public getter and setter methods"},
            {"id": "C", "text": "By making every class an abstract class"},
            {"id": "D", "text": "By declaring all methods static"}
        ],
        "correctOptionId": "B",
        "explanation": "Encapsulation restricts direct state access by keeping class fields private and controlling mutations via public getters and setters.",
        "difficulty": "EASY"
    },
    {
        "section": "Java",
        "topic": "Java Keywords",
        "subtopic": "Final Keyword",
        "question": "What is the consequence of applying the 'final' keyword to a Java method declaration?",
        "options": [
            {"id": "A", "text": "The method cannot be overloaded"},
            {"id": "B", "text": "The method cannot be overridden by subclasses"},
            {"id": "C", "text": "The method executes only once during JVM startup"},
            {"id": "D", "text": "The method cannot return a value"}
        ],
        "correctOptionId": "B",
        "explanation": "A final method cannot be overridden in child classes, ensuring that its specific implementation cannot be changed.",
        "difficulty": "EASY"
    },

    # --- DEVOPS ---
    {
        "section": "DevOps",
        "topic": "Infrastructure as Code",
        "subtopic": "Terraform",
        "question": "Which declarative Infrastructure as Code (IaC) tool uses HCL (HashiCorp Configuration Language) to provision cloud resources across providers?",
        "options": [
            {"id": "A", "text": "Ansible"},
            {"id": "B", "text": "Jenkins"},
            {"id": "C", "text": "Terraform"},
            {"id": "D", "text": "Prometheus"}
        ],
        "correctOptionId": "C",
        "explanation": "Terraform is an open-source declarative IaC tool allowing users to define and provision data center infrastructure using HCL files.",
        "difficulty": "EASY"
    },
    {
        "section": "DevOps",
        "topic": "Deployment Strategies",
        "subtopic": "Canary Releases",
        "question": "What defines a 'Canary Deployment' strategy in modern CI/CD?",
        "options": [
            {"id": "A", "text": "Replacing all production servers simultaneously during maintenance"},
            {"id": "B", "text": "Deploying a new software version to a small percentage of real users before rolling it out to the entire infrastructure"},
            {"id": "C", "text": "Deploying code only on staging environments"},
            {"id": "D", "text": "Deleting historical deployment artifacts"}
        ],
        "correctOptionId": "B",
        "explanation": "Canary deployments roll out changes to a small fraction of users first, monitoring telemetry and error rates before full release.",
        "difficulty": "MEDIUM"
    },

    # --- COMMUNICATION ---
    {
        "section": "Communication",
        "topic": "Professional Etiquette",
        "subtopic": "Email Protocols",
        "question": "When should the 'BCC' (Blind Carbon Copy) field be used in professional corporate email communication?",
        "options": [
            {"id": "A", "text": "To notify direct superiors when expecting a response from them"},
            {"id": "B", "text": "To distribute an email to a large external distribution list while protecting recipient email addresses from disclosure"},
            {"id": "C", "text": "To send email attachments exceeding 50 MB"},
            {"id": "D", "text": "To indicate that all recipients should reply-all"}
        ],
        "correctOptionId": "B",
        "explanation": "BCC conceals individual email addresses from other recipients, ensuring confidentiality on bulk distributions.",
        "difficulty": "EASY"
    },
    {
        "section": "Communication",
        "topic": "Grammar",
        "subtopic": "Active vs Passive Voice",
        "question": "Identify the sentence written in Active Voice:",
        "options": [
            {"id": "A", "text": "The critical security vulnerability was patched by the DevOps engineer."},
            {"id": "B", "text": "The DevOps engineer patched the critical security vulnerability."},
            {"id": "C", "text": "A patch had been deployed across all clusters by the team."},
            {"id": "D", "text": "The code review will be completed by the team lead tomorrow."}
        ],
        "correctOptionId": "B",
        "explanation": "In active voice, the subject performs the action ('The DevOps engineer [subject] patched [verb] the vulnerability [object]').",
        "difficulty": "EASY"
    }
]

# Read existing section_questions_data.py
with open('scripts/section_questions_data.py', 'r', encoding='utf-8') as f:
    content = f.read()

items_code = ""
for q in more_75:
    items_code += "        " + repr(q) + ",\n"

new_content = content.replace("    return data", f"    data.extend([\n{items_code}    ])\n    return data")

with open('scripts/section_questions_data.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Added {len(more_75)} more verified questions to section_questions_data.py")
