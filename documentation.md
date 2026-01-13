### Title:Project Proposal
*** Chaos Under Control: Evaluating Micro-service Resilience Through Chaos Engineering ***

### Problem Statement: ###

Most software systems, whether cloud-native or the common monolith applications are prone to unexpected failures. Outrages caused by pod crashes , latency spike or resource depletion reduce reliability and erode end user trust. 

Without proactive chaos testing, weaknesses are often discovered only after costly downtime. 

This challenge affects not only developers, DevOps/SRE engineers, end-users but also the project shareholders. As a result, resilience testing is essential for building secure and dependable applications.

### Solution Description: ###

The proposed solution is a cloud-native application that evaluates the reliability and security of backend micro-service deployed in Kubernetes. I will deploy a sample backend microservice application, integrate monitoring tool and then introduce controlled failure to assess how the application responds under stress.

Key functions will include:

1. Deployment - containerizing the backend service and deploy it
2. Monitoring and Observability: Using prometheus for metrics collection and grafana for real-time visualization of system health.
3. Chaos Injection: Using Chaos Mesh alongside Python scripts to simulate failures like latency spike, pod crashes or resource exhaustion.
4. Resilience analysis: Measuring recovery time, error handling and alerting to determine system robustness.

### Technologies to be used:

1. Jenkins for the pipeline
2. Docker for containerization &  Kubernetes container orchestration
3. Prometheus for monitoring the deployed micro-service.
4. Python for custom failure injection scripts.