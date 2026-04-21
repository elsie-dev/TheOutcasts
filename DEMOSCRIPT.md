Docker compose up --build
Testing Mpesa Service Do a curl 

curl -s -X POST http://localhost:8001/api/v1/payment/stk-push \
  -H "Content-Type: application/json" \
  -d '{"phone_number":"254740342824","amount":1}' | python -m json.tool 2>&1

  Backend port 8000
  Frontend React - 80
  Prometheus -9090
  Grafana 3000

http://mpesa-service:8001