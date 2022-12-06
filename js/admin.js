// console.log('hello');
let orderData = [];
const orderList = document.querySelector(".js-orderList");
// 初始化
function init(){
    getOrderList();
    renderC3();
};
init();

//取得訂單列表
function getOrderList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{'Authorization': token}
    })
    .then(function(res){
        // console.log(res.data);
        orderData=res.data.orders;
        console.log(orderData);
        let str="";
        orderData.forEach(function(item){
            // 組時間字串
            const timeStamp = new Date(item.createdAt*1000);
            const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;
            // console.log(orderTime);
            // 組產品字串
            let productStr ="";
            item.products.forEach(function(productItem){
                productStr+=`<p>${productItem.title}x${productItem.quantity}</p>`
            })
            // 組訂單字串
            str+=`<tr>
            <td>${item.id}</td>
            <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
                ${productStr}
            </td>
            <td>${orderTime}</td>
            <td>
                <a class="orderStatus" data-status="${item.paid}" data-id="${item.id}" href="#">${item.paid?"已處理":"未處理"}</a>
            </td>
            <td>
                <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
            </td>
        </tr>`
        })
        orderList.innerHTML=str;
        renderC3();
    })
};

orderList.addEventListener('click',function(e){
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    // console.log(targetClass);
    let id = e.target.getAttribute("data-id");
    if(targetClass===null||targetClass===null){
        alert("您點擊錯誤地方了喔");
        return;
    }
    if(targetClass==="delSingleOrder-Btn"){
        deleteOrderItem(id);
        return;
    }
    if(targetClass==="orderStatus"){
        let status = e.target.getAttribute("data-status");
        changeOrderStatus(status,id);
        return;
    }
});

function changeOrderStatus(status,id){
    console.log(status,id);
    let newStatus;
    if(status===true){
        newStatus=false;
    }else{ newStatus=true }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/`,
    {
        "data":{
            "id": id,
            "paid": newStatus
        }
    },{
        headers:{'Authorization': token}
    })
    .then(function(res){
        console.log(res);
        alert("修改訂單成功");
        getOrderList();
    })
};

function deleteOrderItem(id){
console.log(id);
axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,{
        headers:{'Authorization': token}
    })
    .then(function(res){
        console.log(res);
        alert("刪除該筆訂單成功");
        getOrderList();
    })
};

// 渲染c3圖表

function renderC3(){
    console.log(orderData);
    // 物件資料蒐集
    let total = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(total[productItem.category]===undefined){
                total[productItem.category] = productItem.price*productItem.quantity;
            }else{
                total[productItem.category] += productItem.price*productItem.quantity;
            }})
    })
    console.log(total);
    // 做出資料關聯
    let categoryAry = Object.keys(total);
    console.log(categoryAry);
    let newData =[];
    categoryAry.forEach(function(item){
        let ary =[];
        ary.push(item);
        ary.push(total[item]);
        newData.push(ary);
    });
    // 比大小
    newData.sort(function(a,b){
        return b[1]-a[1];
    });
    // 如果筆數大於3筆就統整為其他
    if(newData.length>3){
        let otherTotal = 0;
        newData.forEach(function(item,index){
            if(index>2){
                otherTotal+=newData[index][1];
            }
        })
        newData.splice(3,newData.length-1);
        newData.push(['其他',otherTotal]);
    }

    // C3.js
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData
        },
    });
};

// 刪除全部訂單

const discardAllBtn = document.querySelector(".discardAllBtn");
// console.log(discardAllBtn);
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    console.log(e.target);
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{'Authorization': token}
    })
    .then(function(res){
        console.log(res);
        alert("刪除全部訂單成功");
        getOrderList();
    })
})

function numberWithCommas(x){
    let parts =x.toString().split('.');
    parts[0]= parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,",");
    return parts.join(".");
};

const numbers = numberWithCommas(333333.333);
console.log('numbers',numbers);