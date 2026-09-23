// Comprehensive Networking Knowledge Base for Explanation Generation

const PORTS = {
  "20": { protocol: "FTP Data", desc: "File Transfer Protocol (Data Transfer)", transport: "TCP" },
  "21": { protocol: "FTP Control", desc: "File Transfer Protocol (Command/Control Connection)", transport: "TCP" },
  "22": { protocol: "SSH / SFTP", desc: "Secure Shell (Encrypted remote login and secure file transfer)", transport: "TCP" },
  "23": { protocol: "Telnet", desc: "Unencrypted plaintext remote terminal protocol", transport: "TCP" },
  "25": { protocol: "SMTP", desc: "Simple Mail Transfer Protocol (sending/relaying emails)", transport: "TCP" },
  "53": { protocol: "DNS", desc: "Domain Name System (resolves hostnames to IP addresses)", transport: "UDP/TCP" },
  "67": { protocol: "DHCP Server", desc: "Dynamic Host Configuration Protocol (Server listening port)", transport: "UDP" },
  "68": { protocol: "DHCP Client", desc: "Dynamic Host Configuration Protocol (Client listening port)", transport: "UDP" },
  "69": { protocol: "TFTP", desc: "Trivial File Transfer Protocol (lightweight unauthenticated file transfer for boot/firmware)", transport: "UDP" },
  "80": { protocol: "HTTP", desc: "Hypertext Transfer Protocol (unencrypted World Wide Web traffic)", transport: "TCP" },
  "110": { protocol: "POP3", desc: "Post Office Protocol v3 (retrieves email from server to client)", transport: "TCP" },
  "123": { protocol: "NTP", desc: "Network Time Protocol (clock synchronization across computer networks)", transport: "UDP" },
  "143": { protocol: "IMAP", desc: "Internet Message Access Protocol (manages and reads mail directly on the mail server)", transport: "TCP" },
  "161": { protocol: "SNMP", desc: "Simple Network Management Protocol (monitoring network devices and polling metrics)", transport: "UDP" },
  "162": { protocol: "SNMP Trap", desc: "Simple Network Management Protocol Traps (asynchronous alerts sent by managed devices)", transport: "UDP" },
  "389": { protocol: "LDAP", desc: "Lightweight Directory Access Protocol (directory services queries)", transport: "TCP/UDP" },
  "443": { protocol: "HTTPS", desc: "Hypertext Transfer Protocol Secure (HTTP over TLS/SSL encryption)", transport: "TCP" },
  "445": { protocol: "SMB", desc: "Server Message Block (file sharing and printer access in Windows networks)", transport: "TCP" },
  "636": { protocol: "LDAPS", desc: "Lightweight Directory Access Protocol over TLS/SSL", transport: "TCP" },
  "993": { protocol: "IMAPS", desc: "IMAP over SSL/TLS (secure email retrieval)", transport: "TCP" },
  "995": { protocol: "POP3S", desc: "POP3 over SSL/TLS (secure mail retrieval)", transport: "TCP" },
  "3306": { protocol: "MySQL", desc: "MySQL Database Server default listener", transport: "TCP" },
  "3389": { protocol: "RDP", desc: "Remote Desktop Protocol (Microsoft graphical remote desktop connection)", transport: "TCP/UDP" },
  "5432": { protocol: "PostgreSQL", desc: "PostgreSQL Database Server default listener", transport: "TCP" },
  "8080": { protocol: "HTTP Alternate", desc: "Common alternative HTTP port for web proxies and application servers (e.g. Apache Tomcat)", transport: "TCP" }
};

const PROTOCOL_NAMES = {
  "HTTP": { port: "80", desc: "Hypertext Transfer Protocol transmits unencrypted web pages over TCP." },
  "HTTPS": { port: "443", desc: "Hypertext Transfer Protocol Secure secures web communication using TLS/SSL encryption over TCP." },
  "FTP": { port: "20/21", desc: "File Transfer Protocol uses port 21 for command/control and port 20 for data transfer over TCP." },
  "SSH": { port: "22", desc: "Secure Shell provides encrypted terminal communication and remote management over TCP." },
  "TELNET": { port: "23", desc: "Telnet provides unencrypted command-line access over TCP; deprecated in favor of SSH." },
  "SMTP": { port: "25", desc: "Simple Mail Transfer Protocol pushes and relays outgoing emails between mail servers over TCP." },
  "DNS": { port: "53", desc: "Domain Name System translates human-readable domain names into numerical IP addresses primarily over UDP (and TCP for zone transfers/large responses)." },
  "DHCP": { port: "67/68", desc: "Dynamic Host Configuration Protocol automatically leases IP configurations (IP, mask, gateway, DNS) to client hosts over UDP." },
  "TFTP": { port: "69", desc: "Trivial File Transfer Protocol is a simple, lightweight UDP-based protocol used for network boot (PXE) and router firmware backups." },
  "POP3": { port: "110", desc: "Post Office Protocol version 3 downloads emails from a remote server to a local client over TCP." },
  "NTP": { port: "123", desc: "Network Time Protocol synchronizes system clocks across devices over UDP." },
  "IMAP": { port: "143", desc: "Internet Message Access Protocol allows clients to manage emails stored on the server simultaneously from multiple devices over TCP." },
  "SNMP": { port: "161/162", desc: "Simple Network Management Protocol monitors and manages network devices using UDP port 161 (polling) and port 162 (traps)." },
  "LDAP": { port: "389", desc: "Lightweight Directory Access Protocol queries and modifies directory services (e.g. Active Directory) over TCP." },
  "SMB": { port: "445", desc: "Server Message Block enables shared access to files, printers, and serial ports over TCP." },
  "RDP": { port: "3389", desc: "Remote Desktop Protocol provides graphical user interface remote access over TCP." },
  "MYSQL": { port: "3306", desc: "MySQL relational database listening port." },
  "IMAPS": { port: "993", desc: "IMAP secured with SSL/TLS encryption over TCP." },
  "POP3S": { port: "995", desc: "POP3 secured with SSL/TLS encryption over TCP." }
};

const OSI_LAYERS = {
  "1": { name: "Physical", pdu: "Bits", devices: "Hub, Repeater, Cables, Modems", desc: "Transmits raw, unstructured bit streams over physical transmission media (cables, radio waves, optical fibers)." },
  "2": { name: "Data Link", pdu: "Frames", devices: "Switch, Bridge, NIC", desc: "Provides node-to-node data transfer, physical MAC addressing, media access control (CSMA/CD), and frame error detection (CRC)." },
  "3": { name: "Network", pdu: "Packets", devices: "Router, Layer 3 Switch", desc: "Provides logical addressing (IPv4, IPv6), path determination, packet forwarding, and inter-network routing." },
  "4": { name: "Transport", pdu: "Segments (TCP) / Datagrams (UDP)", devices: "Gateways, Firewalls", desc: "Provides end-to-end communication, segmentation, reassembly, flow control (sliding window), error recovery, and port-to-port multiplexing." },
  "5": { name: "Session", pdu: "Data", devices: "Host systems, OS APIs", desc: "Establishes, manages, checkpoints, and terminates communication sessions and dialogues between applications." },
  "6": { name: "Presentation", pdu: "Data", devices: "Host OS, runtime libraries", desc: "Translates, formats, encrypts/decrypts (TLS/SSL), and compresses data into a syntax understandable by the application layer." },
  "7": { name: "Application", pdu: "Data", devices: "User applications, browser, email client", desc: "Directly interfaces with end-user applications providing network services like web browsing, file transfer, and email." }
};

module.exports = { PORTS, PROTOCOL_NAMES, OSI_LAYERS };
