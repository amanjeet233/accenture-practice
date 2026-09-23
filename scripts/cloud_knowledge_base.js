// Comprehensive Cloud Computing Knowledge Base for Explanation Generation

const CLOUD_SERVICES = {
  // AWS
  "Amazon EC2": { provider: "AWS", category: "Compute (IaaS)", desc: "Elastic Compute Cloud provides scalable virtual machines with full root OS access.", azureEq: "Azure Virtual Machines", gcpEq: "Compute Engine" },
  "Amazon S3": { provider: "AWS", category: "Object Storage", desc: "Simple Storage Service provides industry-leading scalability, data availability, and security for unstructured object data.", azureEq: "Azure Blob Storage", gcpEq: "Cloud Storage" },
  "Amazon RDS": { provider: "AWS", category: "Managed Relational Database (PaaS)", desc: "Relational Database Service automates provisioning, patching, and backups for engines like PostgreSQL, MySQL, and Oracle.", azureEq: "Azure SQL Database", gcpEq: "Cloud SQL" },
  "Amazon DynamoDB": { provider: "AWS", category: "NoSQL Database (Serverless)", desc: "Fully managed, serverless, key-value and document database delivering single-digit millisecond performance at any scale.", azureEq: "Azure Cosmos DB", gcpEq: "Cloud Firestore / Bigtable" },
  "AWS Lambda": { provider: "AWS", category: "Serverless Compute (FaaS)", desc: "Serverless event-driven compute service that executes code in response to triggers without provisioning servers.", azureEq: "Azure Functions", gcpEq: "Cloud Functions" },
  "Amazon VPC": { provider: "AWS", category: "Networking", desc: "Virtual Private Cloud lets you provision a logically isolated section of the AWS Cloud with custom IP ranges, subnets, and routing.", azureEq: "Azure Virtual Network (VNet)", gcpEq: "VPC network" },
  "Amazon Route 53": { provider: "AWS", category: "DNS", desc: "Highly available and scalable cloud Domain Name System (DNS) web service with health checking.", azureEq: "Azure DNS", gcpEq: "Cloud DNS" },
  "Amazon CloudFront": { provider: "AWS", category: "CDN", desc: "Global Content Delivery Network delivering data, videos, and APIs securely with low latency.", azureEq: "Azure CDN", gcpEq: "Cloud CDN" },
  "AWS IAM": { provider: "AWS", category: "Identity & Access", desc: "Identity and Access Management securely controls access to AWS services and resources through users, groups, and policies.", azureEq: "Microsoft Entra ID (Azure AD)", gcpEq: "Cloud IAM" },
  "Amazon SQS": { provider: "AWS", category: "Message Queue", desc: "Simple Queue Service is a fully managed message queuing service for decoupling microservices.", azureEq: "Azure Queue Storage / Service Bus", gcpEq: "Cloud Pub/Sub" },
  "Amazon SNS": { provider: "AWS", category: "Pub/Sub Messaging", desc: "Simple Notification Service provides high-throughput, push-based publish/subscribe messaging and mobile notifications.", azureEq: "Azure Event Grid / Notification Hubs", gcpEq: "Cloud Pub/Sub" },
  "Amazon ECS": { provider: "AWS", category: "Containers", desc: "Elastic Container Service provides fully managed container orchestration.", azureEq: "Azure Container Apps", gcpEq: "Cloud Run" },
  "Amazon EKS": { provider: "AWS", category: "Managed Kubernetes", desc: "Elastic Kubernetes Service simplifies running and managing Kubernetes on AWS.", azureEq: "Azure Kubernetes Service (AKS)", gcpEq: "Google Kubernetes Engine (GKE)" },

  // Azure
  "Azure Virtual Machines": { provider: "Azure", category: "Compute (IaaS)", desc: "On-demand, scalable computing resources running Windows or Linux virtual machines.", awsEq: "Amazon EC2", gcpEq: "Compute Engine" },
  "Azure Blob Storage": { provider: "Azure", category: "Object Storage", desc: "Massively scalable and secure object storage for cloud-native workloads, archives, and data lakes.", awsEq: "Amazon S3", gcpEq: "Cloud Storage" },
  "Azure SQL Database": { provider: "Azure", category: "Managed Relational DB", desc: "Always-up-to-date, fully managed relational database service built for the cloud.", awsEq: "Amazon RDS", gcpEq: "Cloud SQL" },
  "Azure Cosmos DB": { provider: "Azure", category: "Globally Distributed NoSQL", desc: "Fully managed multi-model distributed database with single-digit millisecond latency SLAs.", awsEq: "Amazon DynamoDB", gcpEq: "Cloud Firestore / Spanner" },
  "Azure Functions": { provider: "Azure", category: "Serverless (FaaS)", desc: "Event-driven serverless platform that simplifies running background code triggered by events.", awsEq: "AWS Lambda", gcpEq: "Cloud Functions" },
  "Azure Virtual Network (VNet)": { provider: "Azure", category: "Networking", desc: "Fundamental building block for private networks in Azure, enabling isolated VM communication.", awsEq: "Amazon VPC", gcpEq: "VPC network" },
  "Azure Kubernetes Service (AKS)": { provider: "Azure", category: "Managed Kubernetes", desc: "Simplifies deploying, managing, and scaling containerized applications with Kubernetes.", awsEq: "Amazon EKS", gcpEq: "Google Kubernetes Engine (GKE)" },

  // GCP
  "Compute Engine": { provider: "GCP", category: "Compute (IaaS)", desc: "Customizable, scalable virtual machines running on Google's worldwide fiber infrastructure.", awsEq: "Amazon EC2", azureEq: "Azure Virtual Machines" },
  "Cloud Storage": { provider: "GCP", category: "Object Storage", desc: "Worldwide, durable object storage service with automatic lifecycle transitions.", awsEq: "Amazon S3", azureEq: "Azure Blob Storage" },
  "Cloud SQL": { provider: "GCP", category: "Managed Relational DB", desc: "Fully-managed database service for MySQL, PostgreSQL, and SQL Server.", awsEq: "Amazon RDS", azureEq: "Azure SQL Database" },
  "Cloud Functions": { provider: "GCP", category: "Serverless (FaaS)", desc: "Scalable pay-as-you-go Function-as-a-Service to run code with zero server management.", awsEq: "AWS Lambda", azureEq: "Azure Functions" },
  "VPC network": { provider: "GCP", category: "Networking", desc: "Global virtual network that connects Google Cloud resources across multiple regions securely.", awsEq: "Amazon VPC", azureEq: "Azure Virtual Network (VNet)" },
  "Google Kubernetes Engine (GKE)": { provider: "GCP", category: "Managed Kubernetes", desc: "Google-managed container environment that originated the Kubernetes open-source standard.", awsEq: "Amazon EKS", azureEq: "Azure Kubernetes Service (AKS)" },
  "Cloud CDN": { provider: "GCP", category: "CDN", desc: "Leverages Google's globally distributed edge Points of Presence to cache content close to users.", awsEq: "Amazon CloudFront", azureEq: "Azure CDN" },
  "BigQuery": { provider: "GCP", category: "Cloud Data Warehouse", desc: "Serverless, highly scalable multi-cloud data warehouse designed for business agility.", awsEq: "Amazon Redshift", azureEq: "Azure Synapse Analytics" }
};

const SERVICE_MODELS = {
  "IaaS": { name: "Infrastructure as a Service", role: "Provides raw compute (VMs), storage, and networking. Customer manages OS, runtime, middleware, data, and applications (e.g. AWS EC2, Azure VMs, GCP Compute Engine)." },
  "PaaS": { name: "Platform as a Service", role: "Provides a managed environment for developing, running, and managing applications without hardware or OS maintenance (e.g. AWS Elastic Beanstalk, Heroku, Google App Engine)." },
  "SaaS": { name: "Software as a Service", role: "Delivers end-user software applications over the internet accessible via browser, managed entirely by the vendor (e.g. Microsoft 365, Google Workspace, Salesforce)." },
  "FaaS": { name: "Function as a Service (Serverless)", role: "Executes discrete event-triggered stateless code functions billed strictly by execution time and invocations (e.g. AWS Lambda, Azure Functions, Cloud Functions)." }
};

module.exports = { CLOUD_SERVICES, SERVICE_MODELS };
