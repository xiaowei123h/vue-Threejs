String.prototype.format = (str, x, y, z) => {
    var str = str
    var myArguments = [x, y, z]
    for (var i = 0; i < myArguments.length; i ++) {
        str = str.replace('{' + i + '}', myArguments[i])
    }
    return str
}