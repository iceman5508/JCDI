n_observer = function () {

      this.error = [];
      this.hasError = true;

    /**
     * This is the entry function for the plugin
     * Accepts the id of the form to hijack and then begins the data validation
     * @param id - The id of the form
     * @param dataRules - the rules to validate by
     * @param errorCallback - the call back function to run if an error occurred
     */
    this.hijackForm = function (id, dataRules, errorCallback = function (data) { console.log(data)}) {
        var form = document.getElementById(id);

        form.addEventListener("submit", function (e) {
          //run form info
            var formData = new n_formData(id);
            new n_validator(formData, dataRules);
            this.error = formData.error;
            formData.error=[];
            if(this.error.length > 0) {
                e.preventDefault();
                errorCallback(this.error);
            }else{
                this.hasError = false;
            }

        });

    }



};
/*******************************jcdi form**************************************/
function n_formData(formId){

    /**
     * The form class to search for
     */
    this.tag = formId;

    this.data = {};

    this.error = [];


    /**
     * Get the data from a form
     * This method will automatically be called upon init of the class.
     */
    this.getFormData = function () {
        var elements = document.getElementById(this.tag).elements;
        var obj ={};
        for(var i = 0 ; i < elements.length ; i++){
            var item = elements.item(i);
            obj[item.name] = item.value;
        }

        this.data = obj;


    };

    this.getFormData();


    /**
     * Get a specific data value
     * @param name - the name of the form field whose value will be returned
     * @returns {*}
     */
    this.getData = function (name) {
        return this.data[name];
    };


    /**
     *Stringify the form data
     */
    this.toString = function () {
        return JSON.stringify(this.data);
    };

    /**
     * Check if a particular field is empty
     * @param name - The field name
     * @returns {boolean}
     */
    this.isFieldEmpty = function (name) {
        if(typeof this.data[name] === 'undefined'){
            return true;
        }
        if(!this.data[name] ){
            return true;
        }
        return false;
    };



    /**
     * Compare two field data
     * @param field1 - first field
     * @param field2 - second field
     * @returns {boolean}
     */
    this.compareFields = function (field1, field2) {
        var val1 = this.data[field1].trim();
        var val2 = this.data[field2].trim();

        return (val1.toLowerCase().localeCompare(val2.toLowerCase()) == 0? true : false);
    };


};

/**data type class**/
n_dataType = new function(){
    /**
     * validate if given data is a number
     * @param data
     * @returns {boolean}
     */
    this.isNumeric = function (data) {
        var t1 = !Array.isArray( data ) && (data - parseFloat( data ) + 1) >= 0;
        var t2 = !isNaN(parseFloat(data)) && isFinite(data);
        return t2 || t1? true:false;
    }

        /**
     * Validates if the given data is a string
     * @param data
     * @returns {boolean}
     */
    this.isString = function(data){
        if(typeof data === 'string' || data instanceof String){
            if(!this.isNumeric(data)){
                return true;
            }

        }return false;
    }

    /**
     * validate if given type is boolean or not
     * @param data
     * @returns {boolean}
     */
    this.isBoolean = function (data) {
        return (typeof(data) == typeof(true));

    }

};

/*****data patter class*****/
n_pattern = new function(){

    /**
     * Check if data given is a valid email address or not
     * @param data
     * @returns {boolean}
     */
    this.isEmail = function (data) {
        var email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return email.test(String(data).toLowerCase());
    }

    /**
     * check if data given is a valid social security number or not
     * @param data
     * @returns {boolean}
     */
    this.isSocial = function(data){
        var  ssn = /^[0-9]{3}\-?[0-9]{2}\-?[0-9]{4}$/;
        return ssn.test(data);
    }

    /**
     * Check if the number given is a valid phone number.
     * Not this was written with US formatted numbers in mind, but some
     * international formats are accepted. Do test different formats before using
     * @param data
     * @returns {boolean}
     */
    this.isPhone = function(data){
        var  phone =   /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        return phone.test(data);
    }

    /**
     * Match the data format to the given pattern
     * @param data
     * @param pattern
     */
    this.patternMatch = function (data, pattern) {
       var patternArray = pattern.split('');
       var dataArray = data.split('');
       var valid=false;
       if(patternArray.length == dataArray.length){
           for(var i=0; i<patternArray.length; i++){
               var value = dataArray[i];
               if(patternArray[i] == 'n'){
                   if(n_dataType.isNumeric(value)){
                       valid=true;
                   }
               }else if(patternArray[i] == 'a'){
                   if(!n_dataType.isNumeric(value) && value == value.toLowerCase()){
                       valid=true;
                   }
               }else if(patternArray[i] == 'A'){
                   if(!n_dataType.isNumeric(value) && value == value.toUpperCase()){
                       valid=true;
                   }
               }else if(patternArray[i] == value){
                   valid = true;
               }else{
                   valid = false;
               }
               if(!valid){
                   break;
               }

           }
       }
       return valid;
    }
};

/**
 * Validator class
 * uses the N_formData class
 **/

n_validator = function (formData, dataRule={}) {
    this.data={};

    /**the constructor function for the class*/
    this.constructor = function () {
        this.data =  formData.data;
        for(var field in dataRule){
            var value = this.data[field];
            var name = dataRule[field]['displayName'];
            var validData = true;

           for(var rule in dataRule[field]){
               var ruleValue = dataRule[field][rule];
              switch (rule) {
                  case 'max':
                      if(!this.maxCheck(value, ruleValue)){
                          formData.error.push(name+" has more char than the max of "+ruleValue);
                          validData = false;
                      }
                    break;
                  case 'min':
                     if(!this.minCheck(value, ruleValue)){
                         formData.error.push(name+" must be at least "+ruleValue+" chars.");
                         validData = false;
                     }
                      break;
                  case 'required':
                      if(this.requiredCheck(field,ruleValue)){
                          formData.error.push(name+" is a required field");
                          validData = false;
                      }
                      break;
                  case 'dataType':
                      if(!this.typeCheck(value,ruleValue.toLowerCase())){
                          formData.error.push(name+" is expected to be of type "+ruleValue);
                          validData = false;
                      }
                      break;
                  case 'patternType':
                      if(!this.patternCheck(value,ruleValue.toLowerCase())){
                          formData.error.push(name+" is expected to be a valid "+ruleValue);
                          validData = false;
                      }
                      break;
                  case 'matchField':
                      if(!this.matchCheck(field, ruleValue)){
                          formData.error.push(name+" does not match the "+ruleValue+" field.");
                          validData = false;
                      }
                      break;
                  case 'myPattern':
                      if(!this.myPatternCheck(value, ruleValue)){
                          formData.error.push(name+" is expected to be in a format as such:  "+ruleValue);
                          validData = false;
                      }
                      break;
                  default:
                      break;

              }



           }

            /******add the n_err class to fields with errors***/
            var erroredField = document.getElementById(formData.tag).elements[field];
            if(validData == false){
                if(!erroredField.classList.contains('n_err')){
                    erroredField.classList.add("n_err");
                }
            }else{
                if(erroredField.classList.contains('n_err')){
                    erroredField.classList.remove("n_err");
                }
            }
            /**************************************************/

        }


    }

    /**
     * check if the data meets the minimum requirement
     * return true if it did and false if it does not
     */
    this.minCheck = function(data, min){
        return data.length >= min ? true : false;
    }

    /**
     * check if the data meets the maximum requirement
     * return true if it did and false if it does not
     */
    this.maxCheck=function(data, max){
           return data.length <= max ? true : false;
    }

    /**
     * check if the data passed for being required or not
     * return true if it did and false if it does not
     */
    this.requiredCheck = function(data, required){
        if(required===true){
            return formData.isFieldEmpty(data);
        }else return false;

    }

    /**
     * check if the data passed for being a particular pattern or not
     * return true if it did and false if it does not
     */
    this.patternCheck = function(data, pattern){
        switch (pattern) {
            case 'email':
                return n_pattern.isEmail(data);
                break;
            case 'ssn':
                return n_pattern.isSocial(data);
                break;
            case 'phone':
                return n_pattern.isPhone(data);
                break;
            default:
                return false;
                break;
            }

    }

    /**
     * Check if the data matches the pattern provided
     * @param data
     * @param patter
     * @returns {*}
     */
    this.myPatternCheck = function (data, patter) {
        return n_pattern.patternMatch(data, patter);
    }

    /**
     * check if the data passed for being particular dataType or not
     * return true if it did and false if it does not
     */
    this.typeCheck = function(data, dataType){
        switch (dataType) {
            case 'string':
                return n_dataType.isString(data);
             break;
            case 'number':
                return n_dataType.isNumeric(data);
            break;
            case 'boolean':
                return n_dataType.isBoolean(data);
             break;
            default:
                return false;
             break;

        }

    }

    /**
     * check if the data passed for matching another field or not
     * return true if it did and false if it does not
     */
    this.matchCheck = function(fieldName, compareFieldName){
        return formData.compareFields(fieldName, compareFieldName);
    }

    /**run the constructor**/
    this.constructor();

};