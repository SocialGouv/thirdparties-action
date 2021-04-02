# dashlord-thirdparties-action

Run a third-party scripts scan with puppeteer and report results as JSON.

## Usage

```yaml
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: "socialgouv/dashlord-thirdparties-action@master"
        with:
          url: http://www.free.fr
          output: report.json
```
