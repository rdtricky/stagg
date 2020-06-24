# Stagg MongoDB Integration

Provided by [Stagg.co](https://stagg.co)

## Getting Started

Install the package

```
yarn install @stagg/scrape
```

### Call of Duty

Options:

- `perpetual` - when enabled, scraper will run continuously until the process is terminated
- `refetch` - when enabled, scraper will fetch entire match history every time; when disabled, scraper will never refetch old matches

In some cases, the Call of Duty API will return incomplete responses. To combat this incosistency, it is recommended to enable `refetch` to complete previously incomplete match records.
