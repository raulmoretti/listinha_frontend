function setCookie(name, value, days=1) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }

    document.cookie = name + "=" + (value || "") + expires + "path=/; SameSite=None; Secure=True;";


    // document.cookie = name + "=" + (value || "") + expires + "; SameSite=None; Secure=True;";



}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie = name+'=; Expires/Max-Age=-99999999;';
}
// Função para obter novos tokens de acesso e atualização
async function getToken(email, password) {
    let response = await fetch('http://localhost:8000/token/', {
        method: 'POST',
        body: JSON.stringify({
            email: email,
            password: password
        }),
        headers: {
            'Content-Type': 'application/json',
        }
    });
    let data = await response.json();
    // Armazena os tokens no cookie
    setCookie('access_token', data.access);
    setCookie('refresh_token', data.refresh);

    // Retorna o token de acesso
    return data.access;
}
// Função para checar os tokens de acesso e atualização
async function checkToken() {
    let accessToken = getCookie('access_token');
    // Verifica se o cookie possui o token de acesso
    if (accessToken) {
        document.querySelector("#nav").innerHTML = `
        <li class="nav-item fs-5"><a class="nav-link" href="javascript: void(0)" onclick="logout()">Logout</a></li>
        <li class="nav-item fs-5"><a class="nav-link" href="javascript: void(0)" onclick="go_to_index()">Home</a></li>
        `
        return accessToken;
    } else {
        // Verifica se o cookie possui o token de atualização
        let refreshToken = getCookie('refresh_token');

        if (refreshToken) {
            await fetch('http://localhost:8000/token/refresh/', {
                method: 'POST',
                body: {
                    refresh_token: refreshToken
                }
            })
            .then(response => response.json())
            .then(data => {
                document.querySelector("#nav").innerHTML = `
                <li class="nav-item fs-5"><a class="nav-link" href="javascript: void(0)" onclick="logout()">Logout</a></li>
                <li class="nav-item fs-5"><a class="nav-link" href="javascript: void(0)" onclick="go_to_index()">Home</a></li>
                `
                // Armazena o token de acesso no cookie
                setCookie('access_token', data.access);
                // Retorna o novo token de acesso
                return data.access;
            })
        .catch(error => console.log(error));
        } else {
            document.querySelector("#nav").innerHTML = `
            <li class="nav-item fs-5"><a class="nav-link" href="javascript: void(0)" onclick="get_register_form()">Cadastro</a></li>
            <li class="nav-item fs-5"><a class="nav-link" href="javascript: void(0)" onclick="get_login_form()">Login</a></li>
            `
            // Retorna falso caso não tenha nenhum dos dois tokens
            return false;
        }
    }
}
// Função que irá rodar sempre a pagina for recarregada, ela verifica primeiramente se o usuario está logado com checkToken() e depois renderiza o conteudo da pagina
window.onload = async function() {
    token = await checkToken();
    if (token !== false) {
        go_to_index();
    } else {
        get_login_form();
    }

}



// Função boilerplate dos options que acompanham a requisição fetch
function opt(method, body=undefined, type = 'json', access_token=undefined) {
    if (access_token === undefined) {
        access_token = getCookie('access_token');
    }

    if (access_token === undefined) {
        const options = {
            method: method,
            headers: type = 'json' ? {
                'Content-Type': 'application/json',
                // 'X-CSRFToken': getCookie('csrftoken')
            } : undefined,
            body: type = 'json' ? JSON.stringify(body) : body
        };
        return options;
    } else {
        const options = {
            method: method,
            headers: type = 'json' ? {
                'Content-Type': 'application/json',
                // 'X-CSRFToken': getCookie('csrftoken'),
                'Authorization': 'Bearer ' + access_token
            } : undefined,
            body: type = 'json' ? JSON.stringify(body) : body
        };
        return options;
    }
}
// Função boilerplate fetch para fazer pedido ao servidor
async function my_fetch(url, options={}, type='json') {
    if (type === 'json') {
        let data = (await fetch(url, options)).json();
        return data;
    } else {
        let data = (await fetch(url, options)).text();
        return data;
    }
}



// Fazer pedido ao servidor para obter o modelform do registro de usuario
function get_register_form() {
    document.querySelector("#content_div").innerHTML = "";
    document.querySelector("#content_div").innerHTML = `

    <div class="position-absolute top-50 start-50 translate-middle">
    <div class="card shadow rounded" style="width: 400px;">
        <div class="card-body">

            <form method="POST" enctype="multipart/form-data" id="register-form" name="register" onsubmit="submit_register_form(event)">
                <h2>Cadastro</h2>
                <div class="form-group" style="margin-top: 10px;">
                    <label for="id_email">Email</label>
                    <input type="email" class="form-control" name="email" id="id_email" placeholder="email@example.com" required>
                </div>
                <div class="form-group" style="margin-top: 10px;">
                    <label for="id_first_name">Nome</label>
                    <input type="text" class="form-control" name="first_name" id="id_first_name" placeholder="João" required>
                </div>
                <div class="form-group" style="margin-top: 10px;">
                    <label for="id_last_name">Sobrenome</label>
                    <input type="text" class="form-control" name="last_name" id="id_last_name" placeholder="Ferreira" required>
                </div>
                <div class="form-group" style="margin-top: 10px;">
                    <label for="id_password">Senha</label>
                    <input type="password" class="form-control" name="password" id="id_password" placeholder="********" required>
                </div>
                <div class="form-group" style="margin-top: 10px;">
                    <label for="id_confirm_password">Confirme a Senha</label>
                    <input type="password" class="form-control" name="confirm_password" id="id_confirm_password" placeholder="********" required>
                </div>
            <button type="submit" class="btn btn-primary" style="margin-top: 20px; background-color: #7D00FE;">Confirmar</button>
            </form>
        
        </div>
    </div>
</div>
    `

}
// Fazer pedido ao servidor para fazer submit do form de registro de usuario
async function submit_register_form(event) {
    event.preventDefault();
    let form = document.querySelector("#register-form");
    let formData = new FormData(form);
    let user = await fetch('http://localhost:8000/api/users/', {
        method: 'POST',
        body: formData
        }
    );
    get_login_form();
}
// Fazer pedido ao servidor para obter o formulario de login de usuario
function get_login_form() {
    document.querySelector("#content_div").innerHTML = "";
    document.querySelector("#content_div").innerHTML = `
    <div class="position-absolute top-50 start-50 translate-middle">
        <div class="card shadow rounded" style="width: 400px;">
            <div class="card-body">

                <form method="POST" enctype="multipart/form-data" id="login-form" name="login" onsubmit="login_user(event)">
                    <h2>Login</h2>
                    <div class="form-floating mb-3" style="margin-top: 10px;">
                        <input type="email" class="form-control" name="email" id="id_email" required>
                        <label for="id_email">Email</label>
                    </div>
                    <div class="form-floating mb-3" style="margin-top: 10px;">
                        <input type="password" class="form-control" name="password" id="id_password" required>
                        <label for="id_password">Senha</label>
                    </div>
                <button type="submit" class="btn btn-primary" style="margin-top: 20px; background-color: #7D00FE;">Entrar</button>
                </form>
            
            </div>
        </div>
    </div>
    `
}
// Função para fazer login
async function login_user(event) {
    event.preventDefault();
    let email = document.querySelector("#id_email").value;
    let password = document.querySelector("#id_password").value;

    const access_token = await getToken(email, password);

    go_to_index();
}
// Fazer pedido ao servidor de logout
function logout() {
    // Deletar os tokens do cookie
    eraseCookie('access_token');
    eraseCookie('refresh_token');
    // Atualizar a pagina
    location.reload();
}
// Fazer pedido ao servidor para abrir a pagina index
async function go_to_index() {
    const access_token = await checkToken();

    if (access_token != false) {
        const op = opt('GET');
        const user_request = await my_fetch('http://localhost:8000/api/users/', op); 
        const family_requests_request = await my_fetch('http://localhost:8000/api/request/', op);

        let data = await user_request;
        let first_name = data[0].first_name;
        let last_name = data[0].last_name;

        let data2 = await family_requests_request;

        let insert_requests = [];
        let r = '';
        for (let i=0; i<data2.length; i++) {
            if (data2[i].request_status == 'P') {
                r = 
                `
                    <div class="alert alert-warning alert-dismissible fade show" role="alert">
                        <p>
                            <strong>`+ data2[i].request_owner.first_name + ` ` +  
                            data2[i].request_owner.last_name + `</strong> <small>(<i>` + 
                            data2[i].request_owner.email + `</i>)</small> deseja te convidar para participar da família ` + data2[i].request_family.family_name + `, ele(a) diz: <i>` + data2[i].request_message + `</i>

                        </p>

                        <div>

                            <a href="javascript: void(0)" onclick="accept_invite(event)" data-request-id="` + data2[i].request_id + `" class="link-offset-2 link-underline link-underline-opacity-0">Aceitar</a>

                            <a href="javascript: void(0)" onclick="refuse_invite(event)" data-request-id="` + data2[i].request_id + `" class="link-offset-2 link-underline link-underline-opacity-0">Rejeitar</a>

                        </div>

                    </div>
                `
                insert_requests.push(r);
            } 
        }
        document.querySelector("#content_div").innerHTML = "";
        document.querySelector("#content_div").innerHTML = `
            <div class="ms-5 mt-5">
                <h1 id="title">Olá ` + first_name + ` `+ last_name +`</h1>
            </div>
            <br>
            
    
                ` 
                +  
                insert_requests.join('')
                + 
                `
 
                <br>
                <div class="d-flex flex-wrap justify-content-center text-center row row-cols-md-4 g-4 m-5">

                    <div class="col">
                        <div class="card">
     
                            <a href="javascript: void(0)" onclick="get_create_product_form()" class="link-dark link-offset-2 link-offset-2 link-underline link-underline-opacity-0">
                                <img src="../static/images/white-bread.png" class="card-img-top" alt="...">
                                <div class="card-body">
                                    <h5 class="card-title">Novo Produto</h5>
                                </div>
                            </a>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card">

                            <a href="javascript: void(0)" onclick="get_all_products_page()" class="link-dark link-offset-2 link-offset-2 link-underline link-underline-opacity-0">
                                <img src="../static/images/shopping-bag.png" class="card-img-top" alt="...">
                                <div class="card-body">
                                    <h5 class="card-title">Seus Produto</h5>

                                </div>
                            </a>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card">

                            <a href="javascript: void(0)" onclick="get_create_family_form()" class="link-dark link-offset-2 link-offset-2 link-underline link-underline-opacity-0">
                                <img src="../static/images/family.png" class="card-img-top" alt="...">
                                <div class="card-body">
                                    <h5 class="card-title">Criar Familia</h5>
 
                                </div>
                            </a>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card">

                            <a href="javascript: void(0)" onclick="get_all_families_page()" class="link-dark link-offset-2 link-offset-2 link-underline link-underline-opacity-0">
                                <img src="../static/images/grandparents.png" class="card-img-top" alt="...">
                                <div class="card-body"></div>
                                    <h5 class="card-title">Suas Familias</h5>
      
                                </div>
                            </a>
                        </div>
                    </div>

                </div>
            `
    } else {
        get_login_form();
    }
}


// Função para fazer pedido ao servidor para obter a pagina de criação de produto
async function get_create_product_form() {
    const access_token = await checkToken();
    if (access_token != false) {
        document.querySelector("#content_div").innerHTML = "";
        document.querySelector("#content_div").innerHTML = `
        <div class="position-absolute top-50 start-50 translate-middle">
            <div class="card shadow rounded" style="width: 400px;">
                <div class="card-body">
    
                    <form method="POST" enctype="multipart/form-data" id="new_product_form" name="new_product" onsubmit="submit_create_product_form(event)">
                        <h3>Criar Produto</h3>
                        <div class="form-group" style="margin-top: 10px;">
                            <label for="id_product_name">Nome</label>
                            <input type="text" class="form-control" name="product_name" id="id_product_name" placeholder="Leite" required>
                        </div>
                        <div class="form-group" style="margin-top: 10px;">
                            <label for="id_product_brand">Marca</label>
                            <input type="text" class="form-control" name="product_brand" id="id_product_brand" placeholder="Ninho">
                        </div>
                        <div class="form-group" style="margin-top: 10px;">
                            <label for="id_product_type">Tipo</label>
                            <input type="text" class="form-control" name="product_type" id="id_product_type" placeholder="Integral">
                        </div>
                        <div class="form-group" style="margin-top: 10px;">
                            <label for="id_image">Imagem</label>
                            <input type="file" name="image" id="id_image" />
                        </div>
                    <button type="submit" class="btn btn-primary" style="margin-top: 20px; background-color: #7D00FE;">Criar</button>
                    </form>
                
                </div>
            </div>
        </div>
    `
    } else {
        get_login_form();
    }
}
// Função para fazer pedido ao servidor para fazer submit do form de criação de produto
async function submit_create_product_form(event) {
    const access_token = await checkToken();
    if (access_token != false) {
        event.preventDefault();
        let formData = new FormData(document.querySelector("#new_product_form"));
        body = formData;
        let products = await fetch('http://localhost:8000/api/product/', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            body: body
            }
        )
        get_all_products_page();
    } else {
        get_login_form();
    }
}
// Função para fazer pedido ao servidor para obter a pagina de todos os produtos
async function get_all_products_page() {
    const access_token = await checkToken();
    if (access_token != false) {
        url = 'http://localhost:8000/api/product/'
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'X-CSRFToken': getCookie('csrftoken'),
                'Authorization': 'Bearer ' + access_token
            },
        });
        const products = await response.json();
        document.querySelector("#content_div").innerHTML = "";
        document.querySelector("#content_div").innerHTML = `
        <div class="d-flex justify-content-center mt-5">
            <input class="form-control me-4" type="search" id="search" placeholder="Buscar Produtos..." aria-label="Search" oninput="searchProducts()" style="width: 540px;">
        </div>
    
        <div class="d-flex justify-content-center mt-5">
            <div class="card w-75">
                <ul id="products_list" class="list-group list-group-flush">
                    `
                    + 
                    products.map(product =>
                    `
                    <li class="list-group-item shadow rounded">
                        <div class="d-flex flex-row justify-content-evenly mb-4">
                            <img src="` + product.image + `/" width="100px" height="100px" class="img-fluid rounded-start ms-0 me-5 " alt="..." style="object-fit: cover; object-position: center; margin: 0 auto;">
                            <div>
                                <h5 class="card-title">` + product.product_name + `</h5>
                                <p class="card-text">Marca: ` + product.product_brand + `</p>
                                <p class="card-text">Tipo: ` + product.product_type + `</p>
                            </div>
                            <div class="d-flex flex-column justify-content-evenly">
                                <a href="javascript: void(0)" onclick="get_edit_product_form(event)" data-product-id="`+ product.product_id +`">Editar Produto</a>
                                <a href="javascript: void(0)" onclick="delete_product(event)" data-product-id="`+ product.product_id +`">Deletar Produto</a>
                            </div>
                        </div>
                    </li>
                    `
                    ).join('')
                    +
                    `
                </ul>
            </div>
        </div>
        `
    } else {
        get_login_form();
    }
}
// Função para fazer pedido ao servidor para pesquisar produtos no banco de dados
async function searchProducts() {
    const access_token = await checkToken();
    if (access_token != false) {
        // Obter o valor da pesquisa
        const searchTerm = document.getElementById('search').value;
        // Configurar as opções da requisição
        // Fazer o pedido ao servidor
        url = 'http://localhost:8000/api/product/'
        let products = await fetch(url, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'X-CSRFToken': getCookie('csrftoken'),
                'Authorization': 'Bearer ' + access_token
            },
            body: JSON.stringify({
                'search_term': searchTerm
            })
        });
        // Obter a resposta do servidor
        products = await products.json();

        // Obter referência ao elemento de lista de produtos
        const productsList = document.getElementById('products_list');
        // Crie uma nova lista abaixo de productsList para mostrar os resultados da pesquisa, somente se já não existir
        if (document.querySelector("#products_list2") == null) {
            const productsList2 = document.createElement('ul');
            productsList2.id = 'products_list2';
            productsList2.className = 'list-group list-group-flush';
            productsList.parentNode.insertBefore(productsList2, productsList.nextSibling);
        }

        // Se SeartTerm não for vazio, iterar sobre os produtos
        if (searchTerm != '') {
            document.querySelector("#products_list2").innerHTML = '';
            productsList.style.display = 'none';
            // Iterar sobre os produtos
            for(const product of products) {

                // Criar o elemento de lista
                const li = document.createElement('li');
                li.className = 'list-group-item shadow rounded';
                // Adicionar o nome do produto ao elemento de lista
                li.innerHTML = `
                    <div class="d-flex flex-row justify-content-evenly mb-4">
                        <img src="http://localhost:8000/` + product.image + `/" width="100px" height="100px" class="img-fluid rounded-start ms-0 me-5 " alt="..." style="object-fit: cover; object-position: center; margin: 0 auto;">
                        <div>
                            <h5 class="card-title">` + product.product_name + `</h5>
                            <p class="card-text">Marca: ` + product.product_brand + `</p>
                            <p class="card-text">Tipo: ` + product.product_type + `</p>
                        </div>
                        <div class="d-flex flex-column justify-content-evenly">
                            <a href="javascript: void(0)" onclick="get_edit_product_form(event)" data-product-id="`+ product.product_id +`">Editar Produto</a>
                            <a href="javascript: void(0)" onclick="delete_product(event)" data-product-id="`+ product.product_id +`">Deletar Produto</a>
                        </div>
                    </div>
                `;

            // Adicionar o elemento de lista à lista de produtos 
            document.querySelector("#products_list2").appendChild(li);
            }
        } else {
            // Se searchTerm for vazio, apagar os itens dentro de productsList2 e oculta-lo, e mostrar productsList
            document.querySelector("#products_list2").innerHTML = '';
            document.querySelector("#products_list").style.display = 'block';
    
        }

    } else {
        get_login_form();
    }
}
// Função para fazer pedido ao servidor para obter pagina de edição de produto
async function get_edit_product_form(event) {
    let product_id = event.target.getAttribute("data-product-id");
    let product = await my_fetch('http://localhost:8000/api/product/'+product_id+'/', opt('GET'));
    const access_token = await checkToken();
    if (access_token != false) {
        document.querySelector("#content_div").innerHTML = "";
        document.querySelector("#content_div").innerHTML = `
        <div class="position-absolute top-50 start-50 translate-middle">
        <div class="card shadow rounded" style="width: 400px;">
            <div class="card-body">
                <form method="POST" enctype="multipart/form-data" id="edit_product_form" data-product-id="`+product.product_id+`" onsubmit="submit_edit_product_form(event)">
                    <h3>Editar Produto</h3>
                    <div class="form-group" style="margin-top: 10px;">
                        <label for="id_product_name">Nome</label>
                        <input type="text" class="form-control" name="product_name" id="id_product_name" placeholder="Leite" value=`+product.product_name+` required>
                    </div>
                    <div class="form-group" style="margin-top: 10px;">
                        <label for="id_product_brand">Marca</label>
                        <input type="text" class="form-control" name="product_brand" id="id_product_brand" placeholder="Ninho" value=`+product.product_brand+`>
                    </div>
                    <div class="form-group" style="margin-top: 10px;">
                        <label for="id_product_type">Tipo</label>
                        <input type="text" class="form-control" name="product_type" id="id_product_type" placeholder="Integral" value=`+product.product_type+`>
                    </div>
                    <div class="form-group d-flex flex-column" style="margin-top: 10px;">
                        <label for="id_image" class="mb-3">Imagem</label>
                        <div class=d-flex flex-row>
                            <img src="`+product.image+`" width="100px" height="100px">
                            <input type="file" name="image" id="id_image" value="`+product.image+`"/>
                        </div>

                    </div>
                <div>
                    <button type="submit" class="btn btn-primary" style="margin-top: 20px; background-color: #7D00FE;">Editar</button>
                    <button type="button" class="btn btn-primary" style="margin-top: 20px; background-color: #7D00FE;" onclick="get_all_products_page()">Cancelar</button>
                </div>


                </form>
            
            </div>
        </div>
    </div>
        
            `
    } else {
        get_login_form();
    }
}
// Função para fazer pedido ao servidor para fazer submit do form de edição de produto
async function submit_edit_product_form(event) {
    const access_token = await checkToken();
    if (access_token != false) {
        event.preventDefault();
        let product = event.target.getAttribute("data-product-id");
        let form = document.querySelector("#edit_product_form");
        let formData = new FormData(form);
        body = formData;
        let products = await fetch('http://localhost:8000/api/product/'+ product +'/', {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            body: body
            }
        )

        get_all_products_page();
    } else {
        get_login_form();
    }
    
}
// Função para fazer pedido ao servidor para obter pagina de exclusão de produto
async function delete_product(event) {
    const access_token = await checkToken();
    if (access_token != false) {
        let product = event.target.getAttribute("data-product-id");
        await fetch('http://localhost:8000/api/product/'+ product +'/', {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        })
        get_all_products_page();
    } else {
        get_login_form();
    }   
}


// Função para fazer pedido ao servidor para obter a pagina de criação de familia
async function get_create_family_form() {
    const access_token = await checkToken();
    if (access_token != false) {

        document.querySelector("#content_div").innerHTML = "";
        document.querySelector("#content_div").innerHTML = `
        <div class="position-absolute top-50 start-50 translate-middle">
        <div class="card shadow rounded" style="width: 400px;">

            <div class="card-body">
                <form method="POST" id="new_family_form" onsubmit="submit_create_family_form(event)">
                    <h3>Criar Familia</h3>
                    <p>Nome: </p>
                    <input type="text" name="family_name" id="id_family_name" placeholder="Nome da familia" required />
                    <br><br>
                    <button type="submit" class="btn btn-primary" style="margin-top: 20px; background-color: #7D00FE;">Criar</button>
                </form>
            </div>
            `
    } else {
        get_login_form();
    }
}
// Função para fazer pedido ao servidor para fazer submit do form de criação de familia
async function submit_create_family_form(event) {
    const access_token = await checkToken();
    if (access_token != false) {
        event.preventDefault();
        let form = document.querySelector("#new_family_form");
        let formData = new FormData(form);
    
        body = formData;
        const response = await fetch('http://localhost:8000/api/families/', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            body: body
        })
        const family_id = await response.json().then(data => {
            return data.family_id;
        })
        get_family_page(event, family_id);

    } else {
        get_login_form();
    }
}
// Função para fazer pedido ao servidor para obter a pagina de todas as familias
async function get_all_families_page() {
    const access_token = await checkToken();
    if (access_token != false) {
        const options = opt('GET')
        let families = await my_fetch('http://localhost:8000/api/families/', options); 

        document.querySelector("#content_div").innerHTML = "";
        document.querySelector("#content_div").innerHTML = `

            <div class="d-flex flex-row justify-content-center mt-4">
                <ul id="families_list" class="list-group list-group-flush w-75">
                    `+
                    families.map(family => 
                        `<a class="list-group-item link-dark link-offset-2 link-underline link-underline-opacity-0" href="javascript: void(0)" onclick="get_family_page(event)" data-family-id="`+ family.family_id +`">`+ family.family_name+`</a>
                        `
                    ).join('')+`
                </ul>
            </div>
        `
    } else {
        get_login_form();
    }
}
// Função para fazer pedido ao servidor para obter a pagina da familia
async function get_family_page(event, family_id = undefined) {
    const access_token = await checkToken();
    if (access_token != false) {
        if (family_id == undefined) {
            family_id = event.target.getAttribute("data-family-id");
        }

        const options = opt('GET')
        const user = await my_fetch('http://localhost:8000/api/users/', options).then(data => { return data[0]; });
        const family = await my_fetch('http://localhost:8000/api/families/'+ family_id +'/', options).then(data => { return data; });
        let cart = undefined;
   
        if (family.has_cart) {
            cart = await my_fetch('http://localhost:8000/api/cart/'+ family_id +'/', options).then(data => { return data; });
            let cart_order = cart.cart_orders;
            order_instances = [];
            let uniqueOrders = Array.from(new Set(cart_order));
            // Adiciona as instancias de ordem de pedidos
            for (let i = 0; i < uniqueOrders.length; i++) {
                order_instances.push(await my_fetch('http://localhost:8000/api/order/'+ uniqueOrders[i] +'/', options).then(data => { return data; }));
            }

        } 

        document.querySelector("#content_div").innerHTML = "";
        document.querySelector("#content_div").innerHTML = `

        <div class="d-flex flex-row justify-content-center mt-4">
            <div class="shadow rounded" style="width: 800px;">
                <div class="card">
                    <div class="card-header">
                        <h4>Familia `+ family.family_name +`</h4>
                    </div>
                    <div class="card-body" id="card-body-1">
                        `
                        if (family.family_owner == user.email) { 
                            document.querySelector("#card-body-1").innerHTML += `
                                <p>Você é o dono dessa família. Se quiser pode adicionar novos membros:</p>
                                <a href="javascript: void(0)" onclick="get_add_member_form(event)" data-family-id="`+ family.family_id +`">Convidar membro a sua familia</a>
                            `
                        } else {
                            document.querySelector("#card-body-1").innerHTML += `
                                <p>Você não é o dono dessa família. Somente o dono pode adicionar novos membros.</p>
                            `
                        }
                    
                        document.querySelector("#card-body-1").innerHTML += `
                        <br>

                        <div>
                            <small>Membros desta familia: </small>
                            <ul>
                                    <br>`
                                for (let i = 0; i < family.family_members.length; i++) {
                                    
                                    document.querySelector("#card-body-1").innerHTML += `<li>`+ family.family_members[i] +`</li>`
                                } 
                                `
                            </ul>
                        </div>
                        `
                        if (family.family_owner == user.email) {
                            document.querySelector("#card-body-1").innerHTML += `
                            <div class="mt-3">
                                <button type="button" class="btn btn-danger" onclick="delete_family(event)" data-family-id="`+ family.family_id +`">Apagar Familia</button>
                            </div>`   
                        }`

                    </div>
                </div>
            </div>
        </div>
        `
                        
        document.querySelector("#content_div").innerHTML +=`                   
        <div class="d-flex flex-row justify-content-center mt-4">
        <div class="shadow rounded" style="width: 800px;">
        <div class="card" id="card-2">
            <div class="card-header" id="card-header-2">
                `
                if (family.has_cart == false) { 
                    document.querySelector("#card-header-2").innerHTML += `
                    <h5>Criar Carrinho</h5>
                    <form method="POST" enctype="multipart/form-data" id="new_cart_form" name="create_cart" data-family-id="`+ family.family_id +`" onsubmit="submit_create_cart(event)">
                        <p>Comentário: </p>
                        <input type="textarea" name="cart_comments" id="id_cart_comments" placeholder="'Se esquecerem de algo não reclamem depois!'" size="50" required />
            
                        <button class="btn btn-success" type="submit">Criar Carrinho</button>
                    </form>
                    `
                } else {   
                
                    document.querySelector("#card-header-2").innerHTML += `
                    <h3>Carrinho</h3>
                    <p><i>`+ cart.cart_comments +`</i></p>
                    <button class="btn btn-success" onclick="get_create_order_form(event)" data-family-id="`+ family.family_id +`" data-cart-id="`+ cart.cart_id +`">Adicionar Itens ao Carrinho</button>
                    <button class="btn btn-primary" onclick="complete_cart(event)" data-family-id="`+ family.family_id +`" data-cart-id="`+ cart.cart_id +`">Concluir Carrinho</button>
                
                    `
                }`
            </div>`
            if (family.has_cart != false && order_instances.length > 0) {

                document.querySelector("#card-2").innerHTML += `
                <div class="card-body" id="card-body-2">
                
                <div class="row d-flex justify-content-evenly" id="col-div">`
                

                order_instances.map((order, i) => {
                    const card = document.createElement('div');
                    card.className = 'col-sm-3 card d-flex justify-content-center text-center m-1 p-2';
                    card.id = 'card' + i;
            
                    // add data to card
                    card.innerHTML += `                    
                        `
                    if (order.order_product.image) { 
                        card.innerHTML += `
                        <img class="card-img-top" src="`+ order.order_product.image +`"></img>
                        `
                    }
                 
                    card.innerHTML += `
                        <div class="mb-2">
                            <h5 class="card-title">`
                                + order.order_product.product_name + ` ` + order.order_product.product_brand + ` ` + order.order_product.product_type + ` 
                            </h5><small>`+order.order_owner.email+`</small>
                            <br> <p>Quantidade: ` + order.order_quantity + `</p>
                            <p class="card-text">` + order.order_comment + `</p>
                        </div>
                        `
            
                    if (order.order_owner.email == user.email) { 
                        card.innerHTML += `
                        <div class="d-flex justify-content-between">
   
                            <button class="btn btn-danger btn-sm" onclick="delete_order(event)" data-family-id="`+ family.family_id +`" data-order-id="`+ order.order_id +`">Deletar</button>
                            <button class="btn btn-warning btn-sm" onclick="get_edit_order_form(event)" data-family-id="`+ family.family_id +`" data-order-id="`+ order.order_id +`">Editar</button>

                        </div>
                        `
                    }
            
                    // append card to DOM
                    document.querySelector("#col-div").appendChild(card);
                });          

            `};
                
                </div>

                </div>`     

            }`
                                
        </div>
        </div>
        </div>
    `
    } else {
        get_login_form();
    }
}
// Função para fazer pedido ao servidor para deletar uma familia
async function delete_family(event) {
    const access_token = await checkToken();
    if (access_token != false) {
        let family = event.target.getAttribute("data-family-id");
        url = 'http://localhost:8000/api/families/' + family + '/'
        await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                // 'X-CSRFToken': getCookie('csrftoken'),
                'Authorization': 'Bearer ' + access_token
            },
        })
        get_all_families_page();
    } else {
        get_login_form();
    }   

}
// Função para fazer pedido ao servidor para obter a pagina do formulario de adição de novo membro
function get_add_member_form(event) {
    let family = event.target.getAttribute("data-family-id");
    document.querySelector("#content_div").innerHTML = "";
    document.querySelector("#content_div").innerHTML = `
    <div class="container"> 
        <div class="row">
            <div class="col-md-6 offset-md-3">
                <div class="card mt-5">
                    <div class="card-header" id="card-header-1">
                        <h3>Adicionar Membro</h3>
                    </div>
                    <div class="card-body" id="card-body-1">
                            <form method="POST" enctype="multipart/form-data" id="new_member_form" data-family-id="`+ family +`" onsubmit="add_member(event)">

                            <p>Procure o membro que deseja adicionar:</p>
                            <input type="email" name="request_new_member" id="search_input" oninput="searchUser(event)" data-family-id="`+ family +`" required>
                            <div id="search_results"></div>
                            <br><br>
                            <input type="textarea" name="request_message" id="id_request_message" placeholder="Deixe uma mensagem!" required />
                            <input type="submit" value="Adicionar Membro">
                        </form> 
                    </div>
                    <div class="card-footer" id="card-footer-1">
                        <a href="javascript: void(0)" onclick="get_family_page(event)" data-family-id="`+ family +`">Voltar</a>
                    </div>
                </div>          
            </div>
        </div>
    </div>   

    `
}
// Função para fazer pedido ao servidor para pesquisar um usuario para adicionar a familia
async function searchUser(event) {
    const access_token = await checkToken();
    if (access_token != false) {

        // Obter a familia
        let family = event.target.getAttribute("data-family-id");

        // Obter o valor da pesquisa
        const searchTerm = document.getElementById('search_input').value;
        // Configurar as opções da requisição
        url = 'http://localhost:8000/api/users/';
        let users = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'X-CSRFToken': getCookie('csrftoken'),
                'Authorization': 'Bearer ' + access_token
            },
            body: JSON.stringify({
                'search_term': searchTerm,
                'family_id': family
            })
        })
        users = await users.json();
        // displayUsers = function(users) {
        // Gerar lista com os resultados da pesquisa e colocar no div search_results
        let search_results = document.querySelector('#search_results');
        search_results.style.position = 'absolute';
        search_results.style.zIndex = '1';
        search_results.style.boxShadow = '2px 2px 5px #ccc';
        search_results.style.backgroundColor = '#fff';
        search_results.innerHTML = "";

        // Adicionar os resultados da pesquisa ao div search_results e limitar a 8 resultados
        users.slice(0,8).forEach(user => {
            let user_div = document.createElement('div');
            user_div.setAttribute('value', user.email);
            user_div.innerHTML = `${user.first_name} ${user.last_name} - ${user.email}`;
            user_div.style.padding = '5px';

            // Adicionar evento de click para adicionar o usuario clicado no input e limpar o div search_results
            user_div.addEventListener('click', () => {
                // Adicionar o usuario clicado no input
                document.querySelector('#search_input').value = user.email;
                search_results.innerHTML = "";
            });
            search_results.appendChild(user_div);

            // Adicionar evento de mouseover e mouseout para mudar o cursor e a cor de fundo do div
            user_div.addEventListener('mouseover', (e) => {
                user_div.style.cursor = 'pointer';
                user_div.style.backgroundColor = '#ccc';
                });
            user_div.addEventListener('mouseout', (e) => {
                user_div.style.cursor = 'default';
                user_div.style.backgroundColor = '#fff';
            });
        });

        // Se o usuario clicar em qualquer lugar fora do div search_results, limpar esse div.
        document.addEventListener('click', (e) => {
            if (e.target.id != 'search_input') {
                search_results.innerHTML = "";
            }
        });
    
        // }
    } else {
        get_login_form();
    }   
}
// Função para fazer pedido ao servidor para adicionar um membro a familia
async function add_member(event) {
    const access_token = await checkToken();
    if (access_token != false) {
        event.preventDefault();
        let request_family = event.target.getAttribute("data-family-id");
        let form = document.querySelector("#new_member_form");
        let formData = new FormData(form);
        body = formData
        formData.append('request_family', request_family);
        url = 'http://localhost:8000/api/request/'
        const request = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + access_token  
            },
            body: body
        })

        get_family_page(event, request_family);
    } else {
        get_login_form();
    }

}
// Função para aceitar um pedido de entrada na familia
async function accept_invite(event) {
    const access_token = await checkToken();
    if (access_token != false) {

        let invite = event.target.getAttribute("data-request-id");
        url = 'http://localhost:8000/api/request/' + invite + '/'
        await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // 'X-CSRFToken': getCookie('csrftoken'),
                'Authorization': 'Bearer ' + access_token
            },
            body: JSON.stringify({
                'request_status': 'A'
            })
        })
        window.location.reload();
    } else {
        get_login_form();
    }
}
// Função para recusar um pedido de entrada na familia
async function refuse_invite(event) {
    const access_token = await checkToken();
    if (access_token != false) {

        let invite = event.target.getAttribute("data-request-id");
        url = 'http://localhost:8000/api/request/' + invite + '/'
        await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // 'X-CSRFToken': getCookie('csrftoken'),
                'Authorization': 'Bearer ' + access_token
            },
            body: JSON.stringify({
                'request_status': 'R'
            })
        })
        window.location.reload();
    } else {
        get_login_form();
    }
}


// Função para fazer pedido ao servidor para obter a pagina de criação do carrinho de compra familia
async function submit_create_cart(event) {
    const access_token = await checkToken();
    if (access_token != false) {

        event.preventDefault();
        let family = event.target.getAttribute("data-family-id");
        let form = document.querySelector("#new_cart_form");
        let formData = new FormData(form);
        formData.append('cart_family', family);
        url = 'http://localhost:8000/api/cart/'
        await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            body: formData
        })
        get_family_page(event, family);
            
    } else {
        get_login_form();
    }

}
// Função para fazer pedido ao servidor para obter a pagina de criação de ordem de pedido de um produto (do usuario) para o carrinho da familia
async function get_create_order_form(event) {
    const access_token = await checkToken();
    if (access_token != false) {
        let family = event.target.getAttribute("data-family-id");
        let cart = event.target.getAttribute("data-cart-id");
        url = 'http://localhost:8000/api/product/'
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'X-CSRFToken': getCookie('csrftoken'),
                'Authorization': 'Bearer ' + access_token
            },
        });
        const products = await response.json();

        let productOptions = products.map(product => {
            return `<option value="${product.product_id}">${product.product_name} ${product.product_brand} ${product.product_type}</option>`
        });
        
        document.querySelector('#content_div').innerHTML = ""
        document.querySelector('#content_div').innerHTML = `
        <div class="container"> 
            <div class="row">
                <div class="col-md-6 offset-md-3">
                    <div class="card mt-5">
                        <div class="card-header" id="card-header-1">
                            <h3>Criar Pedido</h3>
                        </div>
                        <div class="card-body" id="card-body-1">
                                <form method="POST" enctype="multipart/form-data" id="new_order_form" data-family-id="`+ family +`" data-cart-id="`+ cart +`" onsubmit="submit_create_order_form(event)">

                                <p>Produto:</p>
                                <select name="order_product" id="order_product">
                                ${productOptions.join('')}
                                </select>
                                <p>Quantidade:</p>
                                <input type="number" name="order_quantity" id="order_quantity" placeholder="Quantidade" min="1" required>
                                <p>Comentário:</p>
                                <input type="text" name="order_comment" id="order_comment" placeholder="Comentário">
                                <input type="submit" value="Criar">
                            </form> 
                        </div>
                        <div class="card-footer" id="card-footer-1">
                            <a href="javascript: void(0)" onclick="get_family_page(event)" data-family-id="`+ family +`">Voltar</a>
                        </div>
                    </div>          
                </div>
            </div>
        </div>
        `
    } else {
        get_login_form();
    }
}
// Função para fazer pedido ao servidor para fazer submit do form de criação de ordem de pedido
async function submit_create_order_form(event) {
    const access_token = await checkToken();
    if (access_token != false) {
        event.preventDefault();
        let family = event.target.getAttribute("data-family-id");
        let cart = event.target.getAttribute("data-cart-id");
        let form = document.querySelector("#new_order_form");
        let formData = new FormData(form);
        formData.append('order_cart', cart);

        url = 'http://localhost:8000/api/order/'
        await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            body: formData
        })

        get_family_page(event, family);

    } else {
        get_login_form();
    }
}
// Função para fazer pedido ao servidor para obter a pagina de edição da ordem de pedido
async function get_edit_order_form(event) {
    const access_token = await checkToken();
    if (access_token != false) {
        let order = event.target.getAttribute("data-order-id");
        let family = event.target.getAttribute("data-family-id");
        url = 'http://localhost:8000/api/order/' + order + '/'
        let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'X-CSRFToken': getCookie('csrftoken'),
                'Authorization': 'Bearer ' + access_token
            },   
        })
        let order_data = await response.json();

        document.querySelector('#content_div').innerHTML = ""
        document.querySelector('#content_div').innerHTML = `
        <div class="container"> 
            <div class="row">
                <div class="col-md-6 offset-md-3">
                    <div class="card mt-5">
                        <div class="card-header" id="card-header-1">
                            <h3>Editar Pedido</h3>
                        </div>
                        <div class="card-body" id="card-body-1">
                                <form method="POST" enctype="multipart/form-data" id="edit_order_form" data-family-id="`+ family +`" data-order-id="`+ order +`" onsubmit="submit_edit_order_form(event)">

                                <p>Produto:</p>
                                <img src="`+ order_data.order_product.image +`" alt="`+ order_data.order_product.product_name +`" width="100" height="100">
                                <p>${order_data.order_product.product_name} ${order_data.order_product.product_brand} ${order_data.order_product.product_type}</p>
                                <p>Quantidade:</p>
                                <input type="number" name="order_quantity" id="order_quantity" placeholder="Quantidade" value="${order_data.order_quantity}" required>
                                <p>Comentário:</p>
                                <input type="text" name="order_comment" id="order_comment" placeholder="Comentário" value="${order_data.order_comment}">
                                <input type="submit" value="Editar">
                            </form> 
                        </div>
                        <div class="card-footer" id="card-footer-1">
                            <a href="javascript: void(0)" onclick="get_family_page(event)" data-family-id="`+ family +`">Voltar</a>
                        </div>
                    </div>          
                </div>
            </div>
        </div>
        `

    } else {
        get_login_form();
    }
}
// Função para fazer pedido ao servidor para fazer submit do form de edição de ordem de pedido
async function submit_edit_order_form(event) {
    const access_token = await checkToken();
    if (access_token != false) {
        event.preventDefault();
        let order = event.target.getAttribute("data-order-id");
        let family = event.target.getAttribute("data-family-id");
        let form = document.querySelector("#edit_order_form");
        let formData = new FormData(form);
    
        url = 'http://localhost:8000/api/order/' + order + '/'
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            body: formData
        })
        const data = await response.json();

        get_family_page(event, family);

    } else {
        get_login_form();
    }
}
// Função para fazer pedido ao servidor para deletar uma ordem de pedido
async function delete_order(event) {
    const access_token = await checkToken();
    if (access_token != false) {
        let order = event.target.getAttribute("data-order-id");
        let family = event.target.getAttribute("data-family-id");
        url = 'http://localhost:8000/api/order/' + order + '/'
        await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
        })
        get_family_page(event, family);
    } else {
        get_login_form();
    }
}
// Função para fazer pedido ao servidor para obter concluir e deletar um carrinho de compras
async function complete_cart(event) {
    const access_token = await checkToken();
    if (access_token != false) {
        let family = event.target.getAttribute("data-family-id");
        let cart = event.target.getAttribute("data-cart-id");
        url = 'http://localhost:8000/api/cart/' + family + '/';
        await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },

        })
        get_family_page(event, family);
    } else {
        get_login_form();
    }            
}