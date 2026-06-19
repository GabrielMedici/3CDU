# 3CDU — Setup de Imagens Locais

O servidor está rodando. Copie os arquivos de imagem para a pasta correta:

## Copiar imagens para `public/images/`

Abra o PowerShell e rode:

```powershell
# Substitua os caminhos pelos locais reais dos seus arquivos
Copy-Item "CAMINHO\1001236247.jpg" "c:\Users\gabri\OneDrive\Documentos\3CDU\public\images\logo.jpg"
Copy-Item "CAMINHO\1001236245.jpg" "c:\Users\gabri\OneDrive\Documentos\3CDU\public\images\hero-bg.jpg"
```

## Mapeamento de nomes esperados pelo código

| Arquivo original    | Nome esperado pelo Next.js       | Uso                  |
|---------------------|----------------------------------|----------------------|
| `1001236247.jpg`    | `public/images/logo.jpg`         | Navbar — avatar logo |
| `1001236245.jpg`    | `public/images/hero-bg.jpg`      | Hero — background    |
| `1001236248.jpg`    | (alternativo ao hero-bg)         | Hero — background    |

> Se quiser usar o 1001236248.jpg no Hero, edite a linha `src="/images/hero-bg.jpg"` em `components/Hero.tsx`.
