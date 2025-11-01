# Google Cloud IP Ranges Connector

A lightweight Cloudflare Worker that provides real-time access to Google Cloud Platform IP ranges with flexible filtering options. Originally designed to work with Fortigate's External Connector feature for dynamic firewall rule management.

## 🎯 Purpose

This worker was created to solve a specific challenge with FortiOS 7.4.x: there's currently no built-in, reliable way to automatically sync Google Cloud IP ranges to firewall objects. By deploying this worker on Cloudflare's edge network, you get:

- ✅ Always up-to-date IP ranges (sourced directly from Google's official API)
- ✅ Fast response times (cached at Cloudflare's edge)
- ✅ Flexible filtering by region and IP family
- ✅ Compatible with Fortigate External Connector feature
- ✅ Zero maintenance required

## 🚀 Features

- **Region Filtering**: Query IP ranges for any Google Cloud region (e.g., `europe-west3`, `us-central1`, `asia-east1`)
- **IP Family Selection**: Choose between IPv4, IPv6, or both
- **Scope Discovery**: List all available Google Cloud regions
- **Edge Caching**: Responses are cached for 15 minutes for optimal performance
- **Simple Text Output**: One CIDR block per line, perfect for automation and firewall integrations

## 📋 Use Case: Fortigate External Connector

FortiOS 7.4.x doesn't provide a native way to dynamically update firewall address objects with Google Cloud IP ranges. This worker bridges that gap by:

1. Fetching the latest IP ranges from Google's official source
2. Filtering by your specific region(s) of interest
3. Serving them in a format that Fortigate's External Connector can consume
4. Automatically updating as Google adds or changes IP ranges

### Example Fortigate Configuration

```
config system external-resource
    edit "gcp-europe-west3-ipv4"
        set type address
        set resource "https://your-worker.workers.dev/?scope=europe-west3&type=ipv4"
        set refresh-rate 60
    next
end
```

## 🛠️ Deployment

### Prerequisites
- A Cloudflare account (free tier works fine)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed

### Steps

1. Clone this repository:
```bash
git clone https://github.com/yourusername/unifyphonefirewallconnector.git
cd unifyphonefirewallconnector
```

2. Deploy to Cloudflare Workers:
```bash
wrangler deploy
```

3. Your worker is now live at `https://your-worker.workers.dev/`

## 📖 API Usage

### Get IP Ranges

Retrieve IP ranges with optional filtering:

```
GET /?scope=<region>&type=<ip-family>
```

#### Parameters

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `scope` | Any GCP region | `all` | Filter by specific Google Cloud region |
| `type` | `ipv4`, `ipv6`, `all` | `all` | Filter by IP address family |
| `list` | `scopes` | - | List all available regions |

### Examples

#### Get all IPv4 addresses for europe-west3
```bash
curl "https://your-worker.workers.dev/?scope=europe-west3&type=ipv4"
```

Output:
```
34.90.0.0/16
34.104.96.0/20
35.198.0.0/16
...
```

#### Get all IP addresses (IPv4 + IPv6) for us-central1
```bash
curl "https://your-worker.workers.dev/?scope=us-central1&type=all"
```

#### Get only IPv6 addresses for asia-east1
```bash
curl "https://your-worker.workers.dev/?scope=asia-east1&type=ipv6"
```

#### List all available Google Cloud regions
```bash
curl "https://your-worker.workers.dev/?list=scopes"
```

Output:
```
africa-south1
asia-east1
asia-east2
asia-northeast1
asia-northeast2
asia-northeast3
asia-south1
asia-south2
asia-southeast1
asia-southeast2
australia-southeast1
australia-southeast2
europe-central2
europe-north1
europe-southwest1
europe-west1
europe-west2
europe-west3
europe-west4
europe-west6
europe-west8
europe-west9
me-central1
me-central2
me-west1
northamerica-northeast1
northamerica-northeast2
southamerica-east1
southamerica-west1
us-central1
us-east1
us-east4
us-east5
us-south1
us-west1
us-west2
us-west3
us-west4
```

#### Get all IPv4 addresses from all regions
```bash
curl "https://your-worker.workers.dev/?type=ipv4"
```

## 🔄 Evolution

This project started as a simple script to fetch IP ranges for `europe-west3` only. It has since evolved to support:

- ✨ All Google Cloud regions worldwide
- ✨ Flexible filtering by IP family (IPv4/IPv6)
- ✨ Region discovery endpoint
- ✨ Edge caching for improved performance
- ✨ Error handling and upstream monitoring

## 🏗️ Technical Details

- **Runtime**: Cloudflare Workers (Edge)
- **Source**: [Google Cloud IP Ranges](https://www.gstatic.com/ipranges/cloud.json)
- **Cache**: 15 minutes (900 seconds)
- **Response Format**: Plain text (one CIDR per line)
- **Content-Type**: `text/plain; charset=utf-8`

## 📝 License

This project is open source and available for anyone to use and modify.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📧 Contact

Created as a practical solution for Fortigate firewall management. Feel free to use and adapt for your own needs!

---

**Note**: This is an independent project and is not affiliated with or endorsed by Google Cloud Platform, Fortinet, or Cloudflare.
