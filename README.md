# Hackathon VTEX Payments

## PARTE 1.1 - AWS Access - Console AWS (Via Eventos da AWS)*
1. Receber event hash da AWS
2. Acessar https://dashboard.eventengine.run/login e entrar com o event hash
3. Clicar em Open Console. Bem vindo ao console AWS, aqui você tem acesso a todas as ferramentas e serviços AWS.

'* Essa é uma das forma de obter uma conta AWS com acesso ao console. Mas para seguir os passos seguintes, você poderia usar outras contas AWS.

## PARTE 1.2 - AWS Access - Criar novo usuário AWS
1. Com o Console AWS aberto, na caixa de Search, procure por IAM e entre na página deste serviço
2. Clicar em Users no menu da esquerda.
3. Add user
4. Depois de entrar um nome, dê next. Depois, selecione `Attach Policies Directly`
5. Selecione `AdministratorAccess` e finalize a criação do usuário
6. Selecione o usuário recém criado e clique na aba `Security credentials`
7. Clique em `create access key` e selecione `Command Line Interface (CLI)`
8. Anote `Access key` e o `Secret access key` em um lugar seguro

## PARTE 1.3 - AWS Access - Configurando AWS CLI
1. Instale o npm (se por algum acaso no mundo, você já não tinha)
2. Instale o [aws cli](https://docs.aws.amazon.com/pt_br/cli/latest/userguide/getting-started-install.html)
3. Execute `aws configure` via terminal e entre com os valores de `Access key` e o `Secret access key` que você obteve no passo anterior
4. Rode um comando simples como `aws s3 ls` sem que erros sejam mostrados para testar o CLI

## PARTE 2.1 - Rodando CDK - Instalação
1. Instale o docker (uma alternativa para o docker desktop em sistemas macOS é o [colima](https://github.com/abiosoft/colima/))
2. Rode o comando `npm install -g aws-cdk`

## PARTE 2.2 - Rodando CDK - Executando o modelo
1. Na pasta raiz deste projeto clonado, rode o comando `npm install` para buildar o código
2. npm install aws-sdk
3. Faça um `cdk boostrap`. Todo o toolkit aws necessário será providenciado na cloud AWS
4. Faça um `cdk deploy`
5. Acesse o console e verifique os serviços que subiram via cloudformation
6. Use `cdk watch` para acionar o deploy automaticamente ao salvar mudanças nos seus arquivos.
* Work hard. Have fun. Make history.
