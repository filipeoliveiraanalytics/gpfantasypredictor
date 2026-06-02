# Constructor Logos

Add constructor logo images here named by constructor code:

- `mer-mark.svg`
- `fer.svg`
- `mcl.png`
- `rbr-mark.svg`
- `haa.svg`
- `alp.svg`
- `rbl.png`
- `wil-mark.svg`
- `cad.svg`
- `aud.svg`
- `amr.png`

After replacing or adding logos, update `manifest.json` and point each code to its file:

```json
{
  "files": {
    "mer": "mer.svg",
    "fer": "fer.svg"
  }
}
```

The app will automatically show image logos for listed files and use a simple text fallback for anything missing.
