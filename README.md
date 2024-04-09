# Test outside of docker

```
npm i
ts-node test.ts

# expected output:
PDFNet is running in demo mode.
Package: base
{ before: 3 }
TESTING PDFs
TESTING IMAGES
TESTING DOCX
Package: office
APPENDING ATTACHMENTS
{ after: 9 }

```

# Test inside docker locally

```
docker build --platform linux/arm64 --provenance=false -t pdftron-test .
docker run -p 9000:8080 pdftron-test
curl "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'

# expected output in container logs:

PDFNet is running in demo mode.
Package: base
{ before: 3 }
TESTING PDFs
TESTING IMAGES
TESTING DOCX
Package: office
APPENDING ATTACHMENTS
{ after: 9 }

```

# 3. Test deployed in a Lambda

Use the image built to deploy a Lambda function using these instructions:
https://docs.aws.amazon.com/lambda/latest/dg/nodejs-image.html#nodejs-image-instructions

```
# expected Lambda logs:

Package: base
2024-04-09T20:28:46.376Z	501db174-1c92-4dc6-823f-083785a27a41	INFO	{ before: 3 }
2024-04-09T20:28:46.378Z	501db174-1c92-4dc6-823f-083785a27a41	INFO	TESTING PDFs
2024-04-09T20:28:46.486Z	501db174-1c92-4dc6-823f-083785a27a41	INFO	TESTING IMAGES
RequestId: 501db174-1c92-4dc6-823f-083785a27a41 Error: Runtime exited with error: signal: segmentation fault
Runtime.ExitError
END RequestId: 501db174-1c92-4dc6-823f-083785a27a41
REPORT RequestId: 501db174-1c92-4dc6-823f-083785a27a41	Duration: 421.26 ms	Billed Duration: 1769 ms	Memory Size: 10240 MB	Max Memory Used: 172 MB	Init Duration: 1346.96 ms
```
