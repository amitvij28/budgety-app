/*MODULES:(Encapsulation) IIFE returning objects. And also using closures. Return all the functions that you want to be public in the returning object.
*/
//Budget Controller API
var budgetController = (function() {
	var Expense  = function(id,description,value) {
		this.id = id;
		this.description=description;
		this.value=value;
		this.percentage= -1;
	};

	var Income  = function(id,description,value) {
		this.id = id;
		this.description=description;
		this.value=value;
	};

	Expense.prototype.calcPercentage=function(totalInc) {
		if(totalInc>0){
			this.percentage=Math.round((this.value/totalInc)*100);
		}else{
			this.percentage=-1;
		}
	};

	Expense.prototype.getPercentage= function() {
		return this.percentage;
	};

	var data = {
		allItems:{
			exp:[],
			inc:[]
		},
		totals:{
			exp:0,
			inc:0
		},
		budget:0,
		percentage:0
	};

	var calculateTotal = function(type) {
		var sum=0;
		data.allItems[type].forEach(function(current) {
			sum += current.value;
		});
		data.totals[type] = sum;
	};

	return {
		AddItem:function(type,desc,val) {
			var newItem,ID;

			if(data.allItems[type].length > 0){
				ID = data.allItems[type][data.allItems[type].length-1].id+1;
			}else{
				ID=0;
			}
			
			if(type==="exp"){
				newItem = new Expense(ID,desc,val);
			}
			else if(type==="inc"){
				newItem = new Income(ID,desc,val);
			}
			
			data.allItems[type].push(newItem);
			return newItem;

		},

		calculateBudget:function() {
			//calculate income and expense
			calculateTotal("exp");
			calculateTotal("inc");
			//calculate budget
			data.budget = data.totals["inc"] - data.totals["exp"];

			//calculate percentage of income that we spent
			if(data.totals["inc"]>0){
				data.percentage=Math.round((data.totals["exp"]/data.totals["inc"])*100);
			}else{
				data.percentage=-1;
			}
			
		},

		calculatePercentages:function() {
			data.allItems.exp.forEach(function(current) {
				current.calcPercentage(data.totals.inc);
			});
		},

		getPercentages:function() {
			//map returnds and stores the data
			var allPerc=data.allItems.exp.map(function(current) {
				return current.getPercentage();
			});
			return allPerc;
		},

		getBudget:function() {
			return {
				budget:data.budget,
				totalInc:data.totals["inc"],
				totalExp:data.totals["exp"],
				percentage:data.percentage
			};
		},

		deleteItem:function(type,id) {
			var ids,index;

			ids=data.allItems[type].map(function(current) {
				return current.id;
			});
			index = ids.indexOf(id);
			if(index!== -1){
				data.allItems[type].splice(index,1);
			}

		},



		testing:function() {
			console.log(data);
		}
	};

})();


//UI Controller API
var UIController = (function()  {

	var DOMstrings ={
		inputType:".add__type",
		inputDescription:".add__description",
		inputValue:".add__value",
		inputBtn:".add__btn",
		incomeContainer:".income__list",
		expenseContainer:".expenses__list",
		budgetLabel:".budget__value",
		incomeLabel:".budget__income--value",
		expenseLabel:".budget__expenses--value",
		percentageLabel:".budget__expenses--percentage",
		container:".container",
		expensesPercLabel:".item__percentage",
		dateLabel:".budget__title--month"
	}

	var formatNumber =function(num,type) {
			var numSplit,int,dec,sign;
			//+/- before the number , eactly decimal points and comma for a thousand
			num = Math.abs(num);//remove the sign
			num=num.toFixed(2);// exactly two decimals,returns a string
			numSplit=num.split(".");
			int = numSplit[0];
			if(int.length>3){
				int=int.substr(0,int.length-3)+","+int.substr(int.length-3,3);
			}
			dec=numSplit[1];
			type==="exp"?sign="-":sign="+";
			return sign+" "+int+"."+dec;
		};

	var nodeListForEach=function(list,callback) {
				for(var i=0;i<list.length;i++){
					callback(list[i],i);
				}
		};

	//public
	return {
		getInput : function() {
		
			return{
				type :document.querySelector(DOMstrings.inputType).value,//inc or exp
				description :document.querySelector(DOMstrings.inputDescription).value,
				value :parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		getDOMstrings:function() {
			return DOMstrings;
		},

		addListItem: function(obj,type) {
			var html,newHtml,element;

			//create html sring with placeholder text
			if(type ==="inc"){
				element=DOMstrings.incomeContainer;
				html ='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}else if(type==="exp"){
				element=DOMstrings.expenseContainer;
				html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

			}

			//replace the placeholder text with some actual data
			newHtml = html.replace('%id%',obj.id);
			newHtml = newHtml.replace('%description%',obj.description);
			newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));

			//insert
			document.querySelector(element).insertAdjacentHTML("beforeend",newHtml);
		},

		clearFields : function() {
			var fields,fieldsArr;
			fields=document.querySelectorAll(DOMstrings.inputDescription+","+DOMstrings.inputValue);
			
			//slice:Returns copy of the array
			fieldsArr=Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current,index,array) {
				current.value="";
				current.description="";
			});
			fieldsArr[0].focus();
		},

		displayBudget:function(obj) {
			var type;
			obj.budget>0?type="inc":type="exp";
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,"inc");
			document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp,"exp");;
			
			if(obj.percentage>0){
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;		
			}else{
				document.querySelector(DOMstrings.percentageLabel).textContent = "--";
			}
		},

		displayPercentages:function (percentages) {
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);//returns a node list
				
			
			nodeListForEach(fields,function(current,index) {
				if(percentages[index]>0){
					current.textContent=percentages[index]+"%";
				}else{
					current.textContent="--";
				}
			});

		},

		displayMonth:function () {
			var now,year,month;
			months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
			now = new Date();
			year=now.getFullYear();
			month=now.getMonth();
			document.querySelector(DOMstrings.dateLabel).textContent=months[month]+", "+year;

		},
		deleteListItem:function(selectorID) {

			var el =document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},
		changeType:function() {
			var fields = document.querySelectorAll(DOMstrings.inputType+","+DOMstrings.inputDescription+","+DOMstrings.inputValue);
			nodeListForEach(fields,function(current) {
				current.classList.toggle("red-focus");
			});
			document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
		}
	};

})();


//Controller API, arguments to make modules more independent
var controller =(function(budgetCtrl,UICtrl) {

	var updateBudget=function() {

		//calculate the budget
		budgetCtrl.calculateBudget();
		//returns the budget
		budget = budgetCtrl.getBudget();
		//display the budget in the UI
		UICtrl.displayBudget(budget);
	
	}

	var ctrlAddItem =  function () {
		var input,newItem;

		//Get the field input data
		input=UICtrl.getInput();
  		
		if(input.description!=="" && !isNaN(input.value) && input.value>0){
			//Add the item to the budget controller
	  		newItem = budgetCtrl.AddItem(input.type,input.description,input.value);
			//add the item to the UI
			UICtrl.addListItem(newItem,input.type);

			//clear the fields
			UICtrl.clearFields();

			//update budget function
			updateBudget();

			//update expense percentage
			updatePercentage();
		}
  		
	}

	var setupEventListeners = function() {
		var DOM = UIController.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener("click",ctrlAddItem);

		document.addEventListener("keypress",function(event) {
			if(event.keycode === 13 || event.which === 13){//which:older browser 
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener("click",ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener("change",UICtrl.changeType);

	};

	var updatePercentage=function () {
		//calculate the percentage
		budgetCtrl.calculatePercentages();
		//read percentage from budget controller
		var percentages = budgetCtrl.getPercentages();
		//update the UI with new percentage
		UICtrl.displayPercentages(percentages);
	};


	var ctrlDeleteItem = function(event) {
		var itemID,splitID,type,ID;

		itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemID){
			//inc-1 or exp-1
			splitID = itemID.split("-");//[0]="inc"/"exp",[1]=id
			type=splitID[0];
			ID =parseInt(splitID[1]);

			//delete the item from the data structure
			budgetCtrl.deleteItem(type,ID);
			//delete the item from the UI
			UICtrl.deleteListItem(itemID);
			//update and show the new budget
			updateBudget();
			//update expense percentage
			updatePercentage();
		}

	};

	//public 
	return {
		init:function() {

			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget:0,
				totalInc:0,
				totalExp:0,
				percentage:"--"
			});
			setupEventListeners();

		}
	}


})(budgetController,UIController);


controller.init();

