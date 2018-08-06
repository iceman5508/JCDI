function errorCallBack(data) {
    alert(data.join('\n'));

}

var rules = {
    'name' : {
        'displayName' : 'Full Name'
        ,'min' : 2
        ,'dataType' : 'string'
    },
    'pwd' : {
        'displayName' : 'Password'
        ,'required' : true
        ,'dataType' : 'string'
    },
    'email' : {
       'displayName': 'Email'
        ,'required': true
        ,'patternType':'email'

    },
    'pwd2' : {
        'displayName' : 'Confirm Password'
        ,'matchField':'pwd'
    },
    'message':{
        'displayName' : 'Message'
        ,'dataType' : 'string'
        ,'min' : 5
        ,'max' : 255
    }
};

new n_observer().hijackForm('contact-form', rules, errorCallBack);
