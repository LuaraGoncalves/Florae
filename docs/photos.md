# Upload de fotos

O painel administrativo permite associar uma foto a cada planta. O envio ocorre ao salvar o formulário e exige autenticação na API. O armazenamento é realizado no Cloudinary; plantas sem foto também são aceitas.

## Configuração

Defina as variáveis no ambiente do backend e reinicie o serviço:

| Variável | Descrição |
| --- | --- |
| `CLOUDINARY_CLOUD_NAME` | Nome do ambiente Cloudinary |
| `CLOUDINARY_API_KEY` | Chave de acesso à API |
| `CLOUDINARY_API_SECRET` | Segredo de autenticação |

As credenciais devem permanecer no backend. Sem essa configuração, o upload fica indisponível, mas o catálogo e o cadastro sem foto continuam funcionando.

## Validação

| Critério | Limite |
| --- | --- |
| Formatos | JPEG, PNG e WebP |
| Tamanho | 5 MB por arquivo |
| Resolução | 25 megapixels |
| Animação | Não permitida |

O backend verifica o conteúdo do arquivo, corrige a orientação, remove metadados e converte a imagem para WebP, com até 1600 pixels por dimensão. As fotos do catálogo são públicas.

## Retenção

A substituição de fotos e a exclusão de plantas não removem os arquivos do Cloudinary. Uploads sem um cadastro concluído também podem permanecer armazenados. A revisão e a remoção de arquivos sem uso devem ser realizadas no provedor.

## Referência

[Documentação de upload do Cloudinary](https://cloudinary.com/documentation/node_image_and_video_upload)
