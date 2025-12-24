# dvron :  威龙引擎

### dvron

```
Usage: dvron <COMMAND>

Commands:
  work  engine working
  data  proc data command
  conf  proc  conf file command
  help  Print this message or the help of the given subcommand(s)
Options:
  -h, --help  Print help
```

### dvron conf

```
Usage: dvron conf <COMMAND>

Commands:
  check  check conf file
  init   init conf file
  clean  clean conf file
  help   Print this message or the help of the given subcommand(s)
```



### dvron work 

```
Usage: dvron work [OPTIONS]

Options:
      --work-root <WORK_ROOT>
          work root ; eg  --work_root = /app conf : /app/conf [default: .]
  -l, --parallel <PARALLEL>
      --stat <STAT_INTERVAL>
          [default: 1]
      --robust <ROBUST>
          robust mode : develop, alpha, beta, online, crucial eg: --robust develop [default: beta]
      --print_stat
  -h, --help
          Print help
```

