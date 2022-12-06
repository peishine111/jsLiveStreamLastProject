const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableList");
function init(){
    getProductList();
    getCartList();
};
init();
let productData = [];
function getProductList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function(res){
        console.log(res.data.products);
        productData = res.data.products;
        renderProductList();
        });
    
};
function combineProductHTMLItem(item){
    return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="">
    <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${numberWithCommas(item.origin_price)}</del>
    <p class="nowPrice">NT$${numberWithCommas(item.price)}</p>
</li>`
};
function renderProductList(){
    let str = "";
        productData.forEach(function(item){
            str+=combineProductHTMLItem(item);
        productList.innerHTML=str;
    })
};

productSelect.addEventListener("change",function(e){
    const category = e.target.value;
    if(category==="全部"){
        renderProductList();
        return;
    };
    let str="";
    productData.forEach(function(item){
        if(item.category===category){
            str+=combineProductHTMLItem(item);
        }
    })
    productList.innerHTML=str;
})

//加入購物車

productList.addEventListener("click",function(e){
    e.preventDefault();
    let addCardBtn = e.target.getAttribute("class");
    if(addCardBtn !== "addCardBtn"){
        return;
    }
    let productId = e.target.getAttribute("data-id");
    console.log(productId);

    let numCheck = 1;
    cartData.forEach(function(item){
        if(item.product.id===productId){
            numCheck= item.quantity+=1;
            console.log(numCheck);
        }
    });

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
        "data": {
            "productId": productId,
            "quantity": numCheck
          }
    }).then(function(res){
        // console.log('addCartList',res);
        // console.log('productId',productId);
        alert("加入購物車");
        getCartList();
    })
})

let cartData = [];
//渲染購物車列表
//渲染總計金額
function getCartList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function(res){
        // console.log('cart',res);
        console.log(res.data.finalTotal);
        const finalTotal = document.querySelector('.js-total');
        // console.log(finalTotal);
        finalTotal.innerHTML = numberWithCommas(res.data.finalTotal);
        cartData= res.data.carts;
        let str="";
        cartData.forEach(function(item){
            str+=`<tr>
            <td>
            <div class="cardItem-title">
                <img src="${item.product.images}" alt="">
                <p>${item.product.title}</p>
            </div>
        </td>
        <td>NT$${numberWithCommas(item.product.price)}</td>
        <td>${item.quantity}</td>
        <td>NT$${numberWithCommas(item.product.price*item.quantity)}</td>
        <td class="discardBtn">
            <a href="#" class="material-icons" data-id="${item.id}">
                clear
            </a>
        </td>
        </tr>`
        })
        // console.log('str',str)
        // console.log(cartList);
        cartList.innerHTML = str;
        });
};

//刪除單筆購物車

cartList.addEventListener('click',function(e){
    e.preventDefault();
    console.log(e.target);
    const cartId = e.target.getAttribute("data-id");
    if(cartId===null){
        alert("您點到其他東西了喔~");
        return;
    };
    console.log(cartId);
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function(res){
        console.log('deleteCartItem',res);
        alert("刪除購物車單品");
        getCartList();
    })
});

//刪除全部購物車

const discardAllBtn = document.querySelector(".discardAllBtn");

discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    console.log(e.target);
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/`)
    .then(function(res){
        console.log('deleteCartAll',res);
        alert("刪除購物車全部");
        getCartList();
    })
    .catch(function(res){
        alert('購物車已經清空請勿重複點選，謝謝!');
    })
});

//送出訂單

const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener('click',function(e){
    e.preventDefault();
    // console.log(e.target,'你點擊到按鈕了');
    if(cartData.length===0){
        alert('請加入購物車');
        return;
    }
    let customerName = document.querySelector('#customerName').value;
    let customerPhone = document.querySelector('#customerPhone').value;
    let customerEmail = document.querySelector('#customerEmail').value;
    let customerAddress = document.querySelector('#customerAddress').value;
    let tradeWay = document.querySelector('#tradeWay').value;
    if(customerName==="" || customerPhone==="" || customerEmail==="" || customerAddress==="" || tradeWay===""){
        alert("請填寫訂單資料");
        validation();
        return;
    }
    if(validateEmail(customerEmail)===false){
        document.querySelector(`[data-message="Email"]`).textContent = "請填寫正確email格式";
        return;
    }

    if(validatePhone(customerPhone)===false){
        document.querySelector(`[data-message="電話"]`).textContent = "請填寫正確手機號碼格式";
        return;
    }

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,{
        "data": {
            "user": {
              "name": customerName,
              "tel": customerPhone,
              "email": customerEmail,
              "address": customerAddress,
              "payment": tradeWay
            }
          }
    }).then(function(res){
        console.log(res);
        alert('訂單建立成功');
        document.querySelector('#customerName').value="";
        document.querySelector('#customerPhone').value="";
        document.querySelector('#customerEmail').value="";
        document.querySelector('#customerAddress').value="";
        document.querySelector('#tradeWay').value="ATM";
        getCartList();
        });

})

// 處理千分位

function numberWithCommas(x){
    let parts =x.toString().split('.');
    parts[0]= parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,",");
    return parts.join(".");
};

// const numbers = numberWithCommas(333333.333);
// console.log('numbers',numbers);

function validateEmail(mail) 
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return true
  }
    return false
}

// const email = ValidateEmail("ff.ff.ss")
// console.log('email',email);

function validatePhone(phone) 
{
 if (/^09[0-9]{8}$/.test(phone))
  {
    return true
  }
    return false
}