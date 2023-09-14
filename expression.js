module.exports = {
    _expression: $ => choice(
        prec(3, $._literal),
        $.function_call,
        $.pointer,
        $._parentheses,
        $._accessor,
        $._binary_expression,
        $._variable,
        $.table,
        $.field,
    ),

    // TODO: Add support for object and collection literals
    _literal: $ => choice(
        $.string,
        $.boolean,
        $.number,
        $.date,
        $.time,
    ),
    string: _$ => /"(\\"|[^"\n])*"/,
    boolean: _$ => choice("True", "False"),
    number: _$ => /-?\d+(\.\d+)?/,
    date: _$ => /!\d\d\d\d-\d\d-\d\d!/,
    time: _$ => /\?\d\d:\d\d:\d\d\?/,

    table: $ => seq("[", $._identifier, "]"),
    field: $ => seq($.table, $._immediate),
    pointer: $ => prec.right(seq("->", $._expression)),
    function_call: $ => seq(
        $._identifier, "(", 
        optional(seq(
            repeat(seq($._fn_arg, ";")), 
            $._fn_arg,
        )), 
        ")"
    ),
    _fn_arg: $ => choice($._expression, $.operator, $.assignment), // Assignment is needed for some builtin methods
    operator: _$ => token(choice(">", "<", "*")), // necessary for some built-in methods
    _parentheses: $ => seq("(", $._expression, ")"),
    _accessor: $ => choice(
        $.pointer_access,
        $.object_access,
        $.member_function_call,
        $.collection_access,
        $.array_access,
    ),
    pointer_access: $ => seq($._expression, "->", optional(/\w+/)),
    object_access: $ => seq(
        $._expression, 
        token.immediate("."), 
        token.immediate(/[a-zA-Z$][\w$]*/)
    ),
    member_function_call: $ => seq(
        $._expression,
        token.immediate("."),
        token.immediate(/[a-zA-Z$][\w$]*/),
        token.immediate("("),
        optional(seq(
            optional(repeat(seq($._expression, ";"))),
            $._expression,
        )),
        token(")"),
    ),
    collection_access: $ => seq(
        $._expression, 
        token.immediate("["),
        $._expression,
        token("]"),
    ),
    array_access: $ => seq($._expression, token.immediate("{"), $._expression, token("}")),
    _binary_expression: $ => prec.left(seq($._expression, choice(
        "+", "-", "/", "*",
        "&", "|", "=", "#",
        "&&", "||",
        ">", "<", ">=", "<=",
        "%", "^", "\^|",
        "<<", ">>", "?+", "?-", "??",
        "*+", "*|"
    ), $._expression)),

    // https://developer.4d.com/docs/Concepts/identifiers - Not entirely accurate. See ∞ excellent test method ∞
    _identifier: _$ => /[a-zA-Z_0-9]([\w ]*[\w])?/,
    _immediate: _$ => token.immediate(/[a-zA-Z_0-9]([\w ]*[\w])?/),
    _variable: $ => choice(
        $.local_variable,
        $.process_variable,
        $.interprocess_variable,
    ),
    local_variable: $ => choice(
        seq("$", $._immediate),
        seq("$", token.immediate("{"), $._expression, token("}")),
    ),
    process_variable: $ => $._identifier,
    interprocess_variable: $ => seq("<>", $._immediate),

}
