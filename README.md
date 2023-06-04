# Hackathon VTEX Payments

## PARTE 1.1 - AWS Access - Console AWS (Via Eventos da AWS)*
1. Receber event hash da AWS
2. Acessar https://dashboard.eventengine.run/login e entrar com o event hash
3. Clicar em Open Console. Bem vindo ao console AWS, aqui você tem acesso a todas as ferramentas e serviços AWS.

'* Essa é uma das forma de obter uma conta AWS com acesso ao console. Mas para seguir os passos seguintes, você poderia usar outras contas AWS.

## PARTE 1.2 - AWS Access - Criar novo usuário AWS para cada membro do time (incluindo para a pessoa que recebeu a conta de evento AWS)
1. Com o Console AWS aberto, na caixa de Search, procure por IAM e entre na página deste serviço
2. Clicar em Users no menu da esquerda.
3. Add user
4. Depois de entrar um username, selecione "Provide user access to the AWS Management Console" e depois "I want to create an IAM user".
5. Defina as regras de password que preferir e clique em next.
6. Depois, selecione `Attach Policies Directly`
7. Selecione `AdministratorAccess` e clique next
8. Revise e finalize a criação do usuário.
9. Depois de finalizado, clique em "Return to users list" e volte à página de listagem de usuarios, clique no usuário recém criado e clique na aba `security credentials``
10. Clique em `create access key` e selecione `Command Line Interface (CLI)`
11. Anote `Access key` e o `Secret access key` em um lugar seguro pois será usado para que este usuário tenha acesso via AWS CLI e o próprio CDK

## PARTE 1.3 - AWS Access - Configurando AWS CLI
1. Instale o npm (14.15.0 or later)
2. Instale o [aws cli](https://docs.aws.amazon.com/pt_br/cli/latest/userguide/getting-started-install.html)
3. Execute `aws configure` via terminal e entre com os valores de `Access key` e o `Secret access key` que você obteve no passo anterior
4. Rode um comando simples como `aws s3 ls` sem que erros sejam mostrados para testar o CLI

## PARTE 2.1 - Rodando CDK - Instalação
1. Rode o comando `npm install -g aws-cdk`

## PARTE 2.2 - Rodando CDK - Executando o modelo
1. Na pasta raiz deste projeto clonado, rode o comando `npm install` para buildar o código
2. npm install aws-sdk
3. Faça um `cdk bootstrap`. Todo o toolkit aws necessário será providenciado na cloud AWS
4. Faça um `cdk deploy`
5. Acesse o console e verifique os serviços que subiram via cloudformation
6. Use `cdk watch` para acionar o deploy automaticamente ao salvar mudanças nos seus arquivos.

## DICAS VALIOSAS
### VIDEO DE TREINAMENTO DE CDK AWS - Assista o vídeo antes de começar o desenvolvimento: 
### CDK – Para se familiarizar com o CDK, execute o máximo que der o workshop em https://cdkworkshop.com/ 
### CLOUD9 – Usar a IDE da AWS pode facilitar sua vida (nao precisaria instalar aws cli e nem aws cdk e nem rodar nada local na sua máquina e todo o deploy de infraestrutura é muito mais rápido)
### CODE WHISPERER – Quer adicionar AI na sua IDE que vai facilitar muito escrever uma stack no CDK? Utilize o code whisperer! Mais informações: https://medium.com/@neonforge/amazon-codewhisperer-how-to-install-ai-code-assistant-for-visual-studio-code-and-use-it-for-free-2580057d48a0
### CONTAS AWS – A partir da conta principal recebida pelo líder do time, criem contas para os demais participantes COM acesso ao console!
### SNIPPETS - Dentro dos Lambdas no CDK, existem snippets de escrita/leitura em DynamoDB e escrita/leitura no SQS para facilitar sua vida
### ARQUITETURA – Lembre-se que a arquitetura proposta é só uma sugestão simplificada. Modificações pensando em segurança, alta disponibilidade e escalabilidade podem dar pontos extras


* Work hard. Have fun. Make history.